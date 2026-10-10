import React, { useState } from 'react';
import { sound } from '../audio';
import { KrejcarIcon } from './KrejcarIcon';
import { HruskaIcon } from './HruskaIcon';
import { GameIcon } from './GameIcon';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
  performanceMode?: boolean;
  onTogglePerformanceMode?: (enabled: boolean) => void;
  showPerfOverlay?: boolean;
  onToggleShowPerfOverlay?: (enabled: boolean) => void;
  dynamicDifficulty?: number;
  onChangeDynamicDifficulty?: (diff: number) => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'controls',
  performanceMode = false,
  onTogglePerformanceMode,
  showPerfOverlay = false,
  onToggleShowPerfOverlay,
  dynamicDifficulty = 2.0,
  onChangeDynamicDifficulty,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="overlay" style={{ zIndex: 45 }}>
      <div
        className="panel"
        style={{
          maxWidth: '960px',
          width: '96%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.85rem' }}>🎮 OVLÁDÁNÍ A CÍL HRY</h2>
        <LadaBotanicalFlourish height={18} />
        <p
          style={{
            fontWeight: 800,
            fontSize: '1.02rem',
            marginTop: '-6px',
            marginBottom: '12px',
            color: '#FEF3C7',
          }}
        >
          Průvodce po české vesnici Bubákov – jak zkrotit nezbedná strašidla, nakupovat v nůši Čertova dědečka a dočkat se ranního kuropění!
        </p>

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
            🕹️ Ovládání & Klávesnice
          </button>
          <button
            className={`tab-btn ${activeTab === 'objective' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('objective');
              sound.coin();
            }}
          >
            🎯 Cíl hry & Fáze noci
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
            🧓 Čertův dědeček & Nůše
          </button>
          <button
            className={`tab-btn ${activeTab === 'weapons' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('weapons');
              sound.coin();
            }}
          >
            ⚔️ Nové zbraně & Arzenál
          </button>
          <button
            className={`tab-btn ${activeTab === 'village' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('village');
              sound.coin();
            }}
          >
            🏘️ Vylepšení v hospodě
          </button>
          <button
            className={`tab-btn ${activeTab === 'perf' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('perf');
              sound.coin();
            }}
          >
            ⚡ Plynulost & Výkon
          </button>
        </div>

        {/* TAB 1: CONTROLS & MOVEMENT */}
        {activeTab === 'controls' && (
          <div
            style={{
              maxHeight: '500px',
              overflowY: 'auto',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '6px',
            }}
          >
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
                  ⏸️ Pauza a odpočinek kdykoliv během hry
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="keycap keycap-accent">P</span>
                  <span style={{ alignSelf: 'center', fontWeight: 900, color: '#78350F' }}>nebo</span>
                  <span className="keycap">Esc</span>
                </div>
              </div>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Stisknutím klávesy <strong>P</strong> (nebo <strong>Esc</strong>) okamžitě <strong>pozastavíte celou hru</strong>.
                Při pauze si můžete v klidu prohlédnout svůj arzenál, úroveň zbraní, zbývající kuráž a získané krejcary,
                nebo výpravu bezpečně ukončit a odnést kořist do hospody. Opětovným stiskem <strong>P</strong> se vrátíte přímo do boje!
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
                <span style={{ fontSize: '1.22rem', fontWeight: 900, color: '#B45309' }}>
                  🧺 Otevření nůše Čertova dědečka (Nákup v terénu)
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className="keycap keycap-accent">E</span>
                  <span style={{ fontWeight: 800, color: '#92400E', fontSize: '0.9rem' }}>nebo kliknutí myší</span>
                </div>
              </div>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Jakmile se v blízkosti zjeví potulný Čertův dědeček a zavolá <em>„Pssst! Perníčky!“</em>, přistupte k němu a stiskněte klávesu <strong>E</strong>,
                nebo klepněte na tlačítko <strong>🧺 OTEVŘÍT DĚDEČKOVU NŮŠI</strong>. Hra se pozastaví a můžete si za perníčky koupit nové zbraně, jejich vylepšení i mocné pasivní dary!
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
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1E3A8A' }}>
                  🏃 Pohyb hrdiny po venkovské krajině
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
                Pohybujte se po ladovských loukách, zasněžených cestách i hřbitovech. Vyhýbejte se přímému střetu se strašidly,
                manévrujte v elipsách a sbírejte voňavé perníčky a zlaté krejcary, které po sobě zanechávají zklidnění bubáci.
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
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#B91C1C' }}>
                  ⚡ Zvláštní hrdinská schopnost (Ultimátum)
                </span>
                <span className="keycap keycap-wide">Mezerník (Space)</span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Každý hrdina má jedinečnou mocnou schopnost, která se postupně nabíjí (při plném nabití se rozzáří ikona vpravo dole):
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
                  <strong>Poutník (Tulák):</strong> <em>Pověstná sukovice</em> – otočka sukovitou holí zraní a silně odhodí okolní bubáky a nepřátele ve větší vzdálenosti vystraší na 4 s (zkrácený cooldown 21 s). Pasivní bonus Tulácký instinkt: +35 % k poškození všech zbraní, výchozí Kuráž 200.
                </li>
                <li>
                  <strong>Pasáček:</strong> <em>Dusot stáda</em> – pastýřská píšťalka přivolá běžící stádo 22 beranů, které smete nepřátele masivním nárazem (140 fyzického poškození a silné odhození, cooldown 30 s). Vysoká rychlost (220) a obří dosah sběru krejcarů.
                </li>
                <li>
                  <strong>Bába kořenářka:</strong> <em>Očistné kadidlo z devatera bylin</em> – vyvolá bylinné sanctuarium (+55 kuráže, +30 dočasný štít, 1,8 s nezranitelnost) a nasákne a zpomalí okolní nepřátele na 4,5 s (120 nature poškození, cooldown 30 s). Pasivně doplňuje +2 kuráže každé 4 s.
                </li>
                <li>
                  <strong>Ponocný:</strong> <em>Noční roh a poplach</em> – zatroubí na volský roh, čímž vystraší nepřátele na 5 s a udělí 110 fyzického poškození s odhozením (cooldown 30 s). Pasivně šíří stálou posvátnou auru lucerny (16 svatého poškození/s).
                </li>
                <li>
                  <strong>Pobožný kostelník:</strong> <em>Farní požehnání</em> – úder kostelního zvonu a sloup svatého světla očistí nemrtvé a démony v okruhu 650 px (běžné nemrtvé okamžitě vymýtí, bosse zasáhne za 25 % max. kuráže, cooldown 35 s).
                </li>
                <li>
                  <strong>Babička a Barunka:</strong> <em>Chléb se solí a vlídné slovo</em> – zmrazí čas; působí buď jako <strong>Food</strong> (chléb nasytí) nebo <strong>Holy</strong> (vlídné slovo zažene démony) podle toho, proti čemu má daný bubák menší odolnost (cooldown 45 s)!
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
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#166534' }}>
                🗡️ Automatický boj a zbraně (Survivors styl)
              </span>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Všechny vaše zbraně (Válečnice, Česneková topinka, Kyselá okurka, Povidlové buchty, Osikový prut, Vidle, Svěcená voda...)
                <strong> útočí na nepřátele zcela automaticky</strong>! Nemusíte mířit myší – vaším hlavním úkolem je taktický pohyb,
                sbírání perníčků i krejcarů a správný výběr nákupů v nůši Čertova dědečka.
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
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#6D28D9' }}>
                📱 Dotykové ovládání (Mobily a tablety)
              </span>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Na dotykových zařízeních se automaticky zobrazuje <strong>virtuální joystick</strong> v levém dolním rohu pro plynulý pohyb
                a akční tlačítko pro spuštění schopnosti ⚡ vpravo dole. Pokud se přiblížíte k Čertovu dědečkovi, objeví se velké tlačítko pro otevření nůše.
                Pauzu vyvoláte kdykoliv horním tlačítkem <strong>⏸️ Pauza</strong>.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: OBJECTIVE & PHASES */}
        {activeTab === 'objective' && (
          <div
            style={{
              maxHeight: '500px',
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
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', color: '#78350F' }}>
                🐓 Hlavní cíl: Přežít noc až do ranního kuropění (5 minut)!
              </h3>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.96rem', lineHeight: 1.4 }}>
                Každá noční výprava v Bubákově trvá přesně <strong>5 minut (300 sekund)</strong> reálného času.
                Pokud vydržíte naživu, v 300. sekundě třikrát hlasitě <strong>zakokrhá vesnický kohout</strong>.
                S prvním ranním paprskem všechna strašidla ztratí svou moc, propadnou panice a rozutečou se! Úroveň je tím slavnostně vyhrána.
              </p>
            </div>

            {/* NIGHT PHASES */}
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
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#1E3A8A' }}>
                ⏳ Fáze noci – jak se stupňuje nebezpečí a přichází temnota:
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
                  <div style={{ fontWeight: 900, color: '#C2410C' }}>🌅 Podvečer (0:00 - 0:45)</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '2px' }}>
                    Začátek výpravy. Slabší strašidýlka (šotci, rarachové). Ideální čas na nasbírání prvních perníčků, krejcarů a první návštěvu Čertova dědečka (od 0:25)!
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
                  <div style={{ fontWeight: 900, color: '#7C2D12' }}>🌇 Soumrak (0:45 - 1:30)</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '2px' }}>
                    Hustnoucí šero, přicházejí divoženky a kostlivci. Na zemi se objevují malované truhly a vyděšení chasníci čekající na záchranu.
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
                  <div style={{ fontWeight: 900, color: '#312E81' }}>🌑 Půlnoc (1:30 - 3:00)</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '2px' }}>
                    Hustá temnota a noční můry. Kolem 2. minuty zaútočí první nebezpečný Mini-boss kraje s obřím perníčkem jako kořistí!
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
                  <div style={{ fontWeight: 900, color: '#991B1B' }}>👹 Černá hodinka & Boss (3:00 - 4:45)</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '2px' }}>
                    Přichází hlavní vládce úrovně s unikátními ataky (mlýnské kameny, balvany, plameny, bumerang hlavy). Dokončete své nákupy u Dědečka!
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
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#2A170A' }}>
                🧺 Co sbírat na venkovských loukách a cestách:
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
                    <span>🍪</span>
                    <span>Voňavé perníčky (Měna pro Dědečka):</span>
                  </div>
                  <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                    Padají z poražených bubáků (malé 2, velké 6, obří 20 z bossů). Slouží k nákupu zbraní a posílení přímo během výpravy!
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400E', fontWeight: 900 }}>
                    <KrejcarIcon size="1.25em" />
                    <span>Krejcar (Vesnická měna):</span>
                  </div>
                  <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                    Trvalá měna ukládaná do hospody U Černého kocoura pro stálá vylepšení řemesel a budov v Bubákově.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 900 }}>
                    <HruskaIcon size="1.25em" />
                    <span>Šťavnaté hrušky (Léčení):</span>
                  </div>
                  <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                    Okamžitě zvednou náladu a doplní kuráž lovce (+15 až +25 kuráže) při zranění v boji.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1E3A8A', fontWeight: 900 }}>
                    <span>✨</span>
                    <span>Zkušenostní jiskry:</span>
                  </div>
                  <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                    Plní ukazatel postupu lovce, zvyšují celkovou odolnost a posilují statistiky.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6D28D9', fontWeight: 900 }}>
                    <span>🏺</span>
                    <span>Hrnce s dušičkami:</span>
                  </div>
                  <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                    Osvobozují zakleté lidské dušičky zpod hrnců vodníků a čertů, otevírají trofeje.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991B1B', fontWeight: 900 }}>
                    <span>📦</span>
                    <span>Malované truhly:</span>
                  </div>
                  <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                    Venkovský ladovský výherní automat (slot machine) se štědrou nadílkou zbraní a krejcarů.
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
              maxHeight: '500px',
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
                <span style={{ fontSize: '3.2rem', lineHeight: 1 }}>🧓</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#78350F', fontWeight: 900 }}>
                    ČERTŮV DĚDEČEK A JEHO NŮŠE
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 800, color: '#92400E', fontSize: '0.98rem' }}>
                    „Perníčky mám rád víc než zlato! Ber, dokud nůše voní!“ – Hlavní systém vylepšování zbraní a pasivních schopností v terénu.
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
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#B45309' }}>
                🧭 Jak funguje a jak se spouští Čertův dědeček?
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.4 }}>
                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 12px' }}>
                  <strong style={{ color: '#92400E' }}>1. Podmínka zjevení (Čas & Perníčky):</strong>
                  <div>
                    Dědeček se v každé výpravě poprvé zjevuje <strong>od 25. sekundy hry</strong>. Podmínkou je, abyste měli nasbíraný dostatek
                    <strong> voňavých perníčků 🍪</strong> alespoň na nejlevnější položku z jeho nůše (obvykle 25–35 perníčků). Pokud jste bez perníčků, dědeček zbytečně nepřekáží.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 12px' }}>
                  <strong style={{ color: '#92400E' }}>2. Zjevení v terénu & Následování hrdiny:</strong>
                  <div>
                    Jakmile jsou podmínky splněny, dědeček se objeví v příjemné blízkosti lovce (220–280 px) se šibalským zavoláním a hláškou <em>„Pssst! Perníčky!“</em>.
                    Dědeček vás trpělivě následuje, takže vám <strong>nikdy neuteče</strong>, i když zrovna utíkáte před hordou čertů!
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 12px' }}>
                  <strong style={{ color: '#92400E' }}>3. Otevření nůše [Klávesa E / Kliknutí]:</strong>
                  <div>
                    Přistupte k němu a stiskněte klávesu <strong>E</strong>, klikněte myší přímo na dědečka nebo na tlačítko <strong>🧺 OTEVŘÍT DĚDEČKOVU NŮŠI</strong>.
                    Vstupem do obchodu se celá hra <strong>bezpečně pozastaví</strong>, takže máte neomezený čas na výběr a strategické plánování.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 12px' }}>
                  <strong style={{ color: '#92400E' }}>4. Pravidelné návraty (Cooldown 25 sekund):</strong>
                  <div>
                    Po uzavření obchodu se dědeček na chvíli rozloučí. Po <strong>25 sekundách odpočinku</strong> se při dostatku perníčků znovu vrátí s novými zásobami!
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
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#166534' }}>
                🎁 Co v dědečkově nůši najdete? (4 nabídky v každém setkání)
              </h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.4 }}>
                Dědečkova nůše nahradila dřívější rušivé vyskakovací okno při postupu na novou úroveň. Nabízí ucelený a přehledný výběr:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '10px' }}>
                <div style={{ background: '#FFFDF5', border: '2px solid #9A3412', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#9A3412', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚔️</span>
                    <span>Garantované zbraně (1–2 v nůši):</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35 }}>
                    V každé nabídce máte jistotu alespoň jedné až dvou zbraní. Můžete získat zbrusu novou zbraň nebo <strong>vylepšit stávající zbraň až na úroveň 8</strong>
                    (+12 % zranění, +8 % kadence, +6 % dosah za každou úroveň)!
                  </p>
                </div>

                <div style={{ background: '#FFFDF5', border: '2px solid var(--ink)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#1E3A8A', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎒</span>
                    <span>Pasivní posílení a dary:</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35 }}>
                    <strong>Sedmimílové krpce</strong> (+20 rychlost), <strong>Čertovské pírko</strong> a <strong>Krvavé jelito</strong> (+10 až +15 % dmg),
                    <strong>Pytlácká lucerna</strong> (+30 magnet), <strong>Záplatovaný kabát</strong> (+25 max kuráž), <strong>Opravdová káva</strong> (-10 % cooldown),
                    <strong>Podkova pro štěstí</strong> (+1 Štěstí), <strong>Bylinková fajfka</strong> (regenerace) a zabijačkové svačiny.
                  </p>
                </div>
              </div>
            </div>

            {/* KEY TRICKS: WAITING DISCOUNT, LUCK, REROLL, CHURCH HOLY WAVE */}
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
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#92400E' }}>
                💡 Klíčové finty a synergie dědečkova obchodu:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.45, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>
                  <strong>⏳ Čekací sleva (až −30 %):</strong> Čím déle dědeček čeká v terénu, tím levnější má své zboží! Za každou vteřinu jeho čekání klesá cena všech předmětů (až o celých 30 %).
                </li>
                <li>
                  <strong>🍀 Vliv ŠTĚSTÍ (Luck):</strong> Vyšší hodnota štěstí lovce poskytuje další stálou slevu (až 20 %) a navíc přihrává do nůše vzácnější a silnější nabídky.
                </li>
                <li>
                  <strong>🎲 Přebalení nůše (Reroll):</strong> Nehodí se vám nabízené zboží? Tlačítkem <em>Přebalit nůši</em> můžete zboží vyměnit (začíná na 4 perníčcích, poté 8, 16...).
                </li>
                <li>
                  <strong>🌟 Cíl 12 nákupů v jedné výpravě:</strong> V horní části obchodu vidíte ukazatel nákupů. Pokud stihnete nakoupit alespoň 12 vylepšení, získáte obrovskou převahu nad půlnočními bossy!
                </li>
                <li>
                  <strong>⛪ Božská synergie s Kaplí svaté vlny:</strong> Pokud máte v hospodě postavenou Kapli svaté vlny, při KAŽDÉM nákupu v dědečkově nůši vyšlehne posvěcená tlaková vlna (100–500 posvátného dmg + silný odhoz v okruhu 400 px), která bezpečně rozmetá všechny dotírající bubáky kolem!
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 4: WEAPONS & ARSENAL */}
        {activeTab === 'weapons' && (
          <div
            style={{
              maxHeight: '500px',
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
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#78350F' }}>
                ⚔️ Kompletní přehled vesnických zbraní & Nejnovější přírůstky
              </h3>
              <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>
                Všechny zbraně útočí automaticky. Každou zbraň můžete v nůši Čertova dědečka vylepšit až na úroveň 8.
                Níže naleznete popis jednotlivých zbraní s důrazem na novinky a jejich bojové využití:
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
                  <span style={{ background: '#FEF08A', border: '1.5px solid #CA8A04', borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 900, color: '#854D0E' }}>
                    ✨ NOVINKA
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Rázná venkovská hospodyně s válečkem na těsto, obíhající v kruhu kolem hrdiny. Způsobuje vysoké plošné poškození (34 dmg) a masivní odhození (knockback 300). Nepostradatelná ochrana před obklíčením!
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
                  <span style={{ background: '#FEF08A', border: '1.5px solid #CA8A04', borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 900, color: '#854D0E' }}>
                    ✨ NOVINKA
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Pronikavá aromatická obranná aura z pečeného chleba s česnekem. Nepřátelům sice uštědří menší zranění, ale <strong>brutálně je odhazuje (síla 320)</strong> a navíc znatelně zpomaluje. Skvělý ochranný kruh.
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
                  <span style={{ background: '#FEF08A', border: '1.5px solid #CA8A04', borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 900, color: '#854D0E' }}>
                    ✨ DEBUFF
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Vystřeluje nakládané okurky do nejbližších bubáků. Zasažený nepřítel zezelená a dostane drtivý oslabující debuff:
                  <strong> dostává o +35 % až +50 % vyšší zranění ze všech vašich ostatních zbraní</strong>! Fantastická synergie.
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
                  Zlatavé kynuté buchty pečené v pekáči. Bubáci se na 3 sekundy zastaví a labužnicky mlsají s hláškou „Ňam, ňam“. Vícero buchet čas sčítá a dává vám čas k úniku.
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
                  Rychlý sečný oblouk osikového proutí. Rychle švihá v půlkruhu a spolehlivě odhání dotěrné skřítky, rarášky a zloděje.
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
                  <GameIcon icon="🔱" size={30} />
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
                  <GameIcon icon="🪓" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Kovaná halapartna</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Těžká zbraň ponocných se širokým obloukovým záběrem. Skvělá pro kosení hustých hord nočních stínů a kostlivců.
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
                  <GameIcon icon="🌾" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Dřevěný cep na obilí</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Drtivý dopad do země vyvolá rázovou vlnu a plošně odhodí i těžší protivníky. Vynikající pro uvolnění prostoru.
                </p>
              </div>

              {/* DEVATERY KVÍTÍ */}
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
                  <GameIcon icon="🌿" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Devatery kvítí</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Voňavý ochranný věnec devíti bylin rotující kolem lovce. Vytváří neustálou bariéru, která pálí nečisté síly.
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
                  <GameIcon icon="❄️" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Sněhová koule</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Tuhá koule z udusaného sněhu s plošným mrazivým efektem. Zpomaluje rychlost bubáků a dává lovci volnější nohy.
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
                  Tradiční posypaný koláč se odráží mezi bubáky jako lahodný bumerang / ricochet a nutí je mlsat.
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
                  <GameIcon icon="🥔" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Horký brambor z popela</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Brambor vytažený ze žhavého popela popálí bubáky a zanechá kouřící ohnisko, které zraňuje každého, kdo jím projde.
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
                  <GameIcon icon="🐝" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Včelí roj z úlu</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Autonomní roj bzučících včel, který sám aktivně vyhledává nejbližší strašidla a neúnavně do nich píchá žihadla.
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
                  <GameIcon icon="🕯️" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Hromnička</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Posvěcená hromniční svíce pulzuje v pravidelných intervalech posvátným světlem, které pálí všechna temná zjevení.
                </p>
              </div>

              {/* KROPENKA SE SVĚCENOU VODOU */}
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
                  <GameIcon icon="✨" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Kropenka se svěcenou vodou</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Svěcená voda z farní kapličky kropí široký vějíř posvátných kapek. Nemrtví a pekelníci proti ní mají slabý odpor a utrží až 2× větší poškození!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VILLAGE & TAVERN UPGRADES */}
        {activeTab === 'village' && (
          <div
            style={{
              maxHeight: '500px',
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
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', color: '#78350F' }}>
                🏘️ Hospoda U Černého kocoura – trvalý rozvoj vesnice Bubákov
              </h3>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Žádný sesbíraný krejcar nepřijde nazmar! Po každé výpravě navštivte hospodu na návsi a investujte své úspory
                do rozvoje obecních řemesel a budov. Tato vylepšení jsou <strong>trvalá pro všechny vaše lovce</strong>:
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
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#1E3A8A' }}>
                ⚒️ Přehled obecních budov a jejich stálých bonusů:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '10px' }}>
                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#C2410C', fontSize: '0.98rem' }}>🥖 Pekárna u rozpálené pece</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Pekelný žár:</strong> +10 % k poškození všech zbraní lovce za každou úroveň pekárny.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#166534', fontSize: '0.98rem' }}>🌾 Pšeničné lano a polní mez</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Pozorná aura:</strong> +25 k dosahu magnetu pro sběr krejcarů a perníčků za každou úroveň.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#1E3A8A', fontSize: '0.98rem' }}>💧 Vodní mlýn na náhonu</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Vodní proud:</strong> +15 k rychlosti chůze lovce za každou úroveň náhonu.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#78350F', fontSize: '0.98rem' }}>🧱 Kamenné hradby a bašta</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Kamenné zdi:</strong> +25 maximální kuráž a +5 % odolnost proti vylekání.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#991B1B', fontSize: '0.98rem' }}>🛡️ Šenkýřův ochranný štít</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Obrněná mysl:</strong> Na začátku výpravy získáte ochranný štít kuráže (40 + úroveň × 20 bodů kuráže).
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#4338CA', fontSize: '0.98rem' }}>🔔 Zvonice na návsi</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Zrychlení ultimátu:</strong> +8 % k rychlosti odpočtu cooldownu speciální schopnosti lovce.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#B45309', fontSize: '0.98rem' }}>⚒️ Kovářská výheň</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Pevná výheň:</strong> +2 flat damage ke každému jednotlivému zásahu jakékoliv zbraně!
                  </div>
                </div>

                <div style={{ background: '#FEF3C7', border: '2px solid #D97706', borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#B45309', fontSize: '0.98rem' }}>⛪ Kaple svaté vlny</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Svatá vlna u Dědečka:</strong> Při každém nákupu v dědečkově nůši vyšle kaple posvěcenou tlakovou vlnu (100–500 dmg + odhoz v okruhu 400 px)!
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
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#166534' }}>
                🧠 Zlaté rady pro přežití nejtemnější noci:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.35 }}>
                <div>
                  🔄 <strong>Nikdy nezůstávejte stát na místě:</strong> Pohybujte se v širokých elipsách kolem shluků bubáků. Zabráníte tím obklíčení rychlými šotky či divoženkami.
                </div>
                <div>
                  🧄 <strong>Kombinujte zbraně na dálku i na blízko:</strong> Česneková topinka nebo Válečnice vytvoří ochranný kruh kolem lovce, zatímco Kyselá okurka nepřátele oslabí a buchty je donutí mlsat na dálku.
                </div>
                <div>
                  🍪 <strong>Sbírejte perníčky okamžitě:</strong> Každý perníček se počítá pro nákup v nůši Čertova dědečka. Čím dříve nakoupíte, tím snáze zdoláte půlnočního minibosse.
                </div>
                <div>
                  💥 <strong>Odveta lovce na blízko:</strong> Kdykoliv vás bubák zraní na blízko, automaticky ho odhodíte pryč a uštědříte mu zranění rovné 15 % vaší maximální Kuráže (odolnosti běžných monster zde nefungují, odolává pouze boss levelu)!
                </div>
                <div>
                  ⏸️ <strong>Nebojte se využívat pauzu [P]:</strong> Když je na obrazovce příliš mnoho projektilů nebo strašidel, stiskněte <strong>P</strong>. Zjistíte, kolik vám zbývá kuráže, kde se nachází cíl a naplánujete další manévr.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PERFORMANCE & SETTINGS */}
        {activeTab === 'perf' && (
          <div
            style={{
              maxHeight: '500px',
              overflowY: 'auto',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '6px',
            }}
          >
            {/* DYNAMIC DIFFICULTY SLIDER */}
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.22rem', fontWeight: 900, color: '#92400E' }}>
                    🔥 Dynamická obtížnost (Režisér výpravy)
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', fontWeight: 700, color: '#451A03' }}>
                    Řídí chování Režiséra výpravy, rozpočet hrozeb, Klešťové sevření a drtivé protiúdery po oddychu.
                  </p>
                </div>
                <span
                  style={{
                    background:
                      dynamicDifficulty >= 1.95
                        ? '#7F1D1D'
                        : dynamicDifficulty >= 1.7
                        ? '#DC2626'
                        : dynamicDifficulty >= 1.45
                        ? '#D97706'
                        : dynamicDifficulty >= 1.2
                        ? '#0284C7'
                        : '#16A34A',
                    color: '#FFFFFF',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontWeight: 900,
                    fontSize: '0.98rem',
                    border: '2px solid var(--ink)',
                  }}
                >
                  {dynamicDifficulty >= 1.95
                    ? '2.00× Pekelná štvanice (Výchozí / Max)'
                    : dynamicDifficulty >= 1.7
                    ? '1.75× Divoká štvanice'
                    : dynamicDifficulty >= 1.45
                    ? '1.50× Zlověstná noc'
                    : dynamicDifficulty >= 1.2
                    ? '1.25× Neklidné povětří'
                    : '1.00× Běžná výprava'}
                </span>
              </div>

              <div style={{ margin: '10px 0 8px 0' }}>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.25"
                  value={dynamicDifficulty}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    sound.coin();
                    onChangeDynamicDifficulty?.(val);
                  }}
                  style={{
                    width: '100%',
                    accentColor: '#92400E',
                    cursor: 'pointer',
                    height: '10px',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#78350F',
                    marginTop: '4px',
                  }}
                >
                  <span>1.00× (Běžná)</span>
                  <span>1.25×</span>
                  <span>1.50×</span>
                  <span>1.75×</span>
                  <span>2.00× (Pekelná - Max)</span>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1.5px dashed #B45309',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#451A03',
                  marginTop: '8px',
                }}
              >
                {dynamicDifficulty >= 1.95 && (
                  <span>
                    👹 <strong>Pekelná štvanice (Doporučeno pro zkušené lovce):</strong> Drtivý přepad po každém oddychu, zkrácená asistence Režiséra při nízké Kuráži, přetékající rozpočet tvoří Ostřílené běsy a nepřetržitý tlak.
                  </span>
                )}
                {dynamicDifficulty >= 1.7 && dynamicDifficulty < 1.95 && (
                  <span>
                    🐺 <strong>Divoká štvanice:</strong> +75 % rozpočet hrozeb, časté taktické formace a rychlý nástup Ostřílených běsů při zaplnění arény.
                  </span>
                )}
                {dynamicDifficulty >= 1.45 && dynamicDifficulty < 1.7 && (
                  <span>
                    🌲 <strong>Zlověstná noc:</strong> +50 % rozpočet hrozeb, Režisér aktivuje Klešťové sevření z obou stran a Zrádný terén v dráze pohybu.
                  </span>
                )}
                {dynamicDifficulty >= 1.2 && dynamicDifficulty < 1.45 && (
                  <span>
                    💨 <strong>Neklidné povětří:</strong> +25 % rozpočet hrozeb, častější nástup taktických hlídek a pružnější střídání fází.
                  </span>
                )}
                {dynamicDifficulty < 1.2 && (
                  <span>
                    🌾 <strong>Běžná výprava:</strong> Původní tempo hry, základní rozpočet hrozeb a standardní asistence při lovcově oslabení.
                  </span>
                )}
              </div>
            </div>

            {/* HIGH PERF MODE */}
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.22rem', fontWeight: 900, color: '#92400E' }}>
                    ⚡ Režim vysokého výkonu (Plynulý chod 60 FPS)
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', fontWeight: 700, color: '#451A03' }}>
                    Optimální pro slabší počítače, starší notebooky nebo telefony. Snižuje strop nepřátel o ~40 % a omezuje částice, aby hra nikdy neztrácela rychlost.
                  </p>
                </div>
                <button
                  className="lada-btn"
                  style={{
                    background: performanceMode ? '#16A34A' : '#78350F',
                    color: '#FFFFFF',
                    padding: '8px 20px',
                    fontSize: '1rem',
                  }}
                  onClick={() => {
                    sound.coin();
                    onTogglePerformanceMode?.(!performanceMode);
                  }}
                >
                  {performanceMode ? '✅ ZAPNUTO (Plynulý)' : '⚪ VYPNUTO (Plný)'}
                </button>
              </div>
            </div>

            {/* FPS OVERLAY */}
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.22rem', fontWeight: 900, color: '#92400E' }}>
                    📊 Ukazatel FPS a statistik na obrazovce
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', fontWeight: 700, color: '#451A03' }}>
                    Zobrazuje v levém horním rohu aktuální snímkovou frekvenci, čas vykreslení (ms), počet aktivních nepřátel, střel a částic.
                  </p>
                </div>
                <button
                  className="lada-btn"
                  style={{
                    background: showPerfOverlay ? '#16A34A' : '#78350F',
                    color: '#FFFFFF',
                    padding: '8px 20px',
                    fontSize: '1rem',
                  }}
                  onClick={() => {
                    sound.coin();
                    onToggleShowPerfOverlay?.(!showPerfOverlay);
                  }}
                >
                  {showPerfOverlay ? '✅ ZAPNUTO' : '⚪ VYPNUTO'}
                </button>
              </div>
            </div>

            {/* ENGINE OPTIMIZATIONS */}
            <div
              style={{
                background: 'rgba(40, 25, 15, 0.95)',
                border: '3px solid #D9A036',
                borderRadius: '8px',
                padding: '14px 18px',
                color: '#F3E9D2',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.18rem', fontWeight: 900, color: '#FDE047' }}>
                ⚙️ Implementovaná technologická vylepšení motoru hry:
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <li>
                  <strong>Blesková prostorová mřížka (Spatial Hash O(1)):</strong> Zásahy střel, švihy zbraní i aury hromničky a česnekové topinky používají bezztrátový 32bitový číselný index bez alokací řetězců.
                </li>
                <li>
                  <strong>Hardware-akcelerovaný render barevných variant:</strong> Místo pomalých filtrů prohlížeče (ctx.filter) se sazoví rarášci, krvaví kostlivci a obrnění zbojníci tónují přímým GPU kompozitingem.
                </li>
                <li>
                  <strong>Okamžitý úklid poražených strašidel:</strong> Uprchlí nebo zklidnění bubáci po 2 sekundách či opuštění obrazovky uvolňují paměť a nezpomalují další vlny.
                </li>
                <li>
                  <strong>Cirkulace vzdálených nepřátel:</strong> Zbloudilí nepřátelé v temnotě se automaticky přemisťují k okraji zorného pole, takže se neplýtvá výpočetním časem na prázdné kilometry.
                </li>
                <li>
                  <strong>Tlumení záplavy číselných textů poškození:</strong> Rychlé plošné aury sjednocují mikropoškození, aby se netvořily stovky textů za sekundu.
                </li>
              </ul>
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
            }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
          >
            Rozumím a vím, jak na to! ⚔️
          </button>
        </div>
      </div>
    </div>
  );
};
