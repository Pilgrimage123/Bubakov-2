import React, { useState } from 'react';
import { sound } from '../audio';
import { CzechBuchtaIcon } from './CzechBuchtaIcon';
import { KrejcarIcon } from './KrejcarIcon';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'controls' | 'objective' | 'tips';
}

export const ControlsModal: React.FC<ControlsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'controls',
}) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'objective' | 'tips'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="overlay" style={{ zIndex: 45 }}>
      <div className="panel" style={{ maxWidth: '920px', width: '95%' }}>
        <h2>🎮 OVLÁDÁNÍ A CÍL HRY</h2>
        <p style={{ fontWeight: 800, fontSize: '1.08rem', marginTop: '-6px', marginBottom: '14px', color: '#FEF3C7' }}>
          Průvodce venkovského lovce – jak přežít hrůzy noci v Bubákově a dočkat se ranního kuropění!
        </p>

        {/* Navigation Tabs */}
        <div className="modal-tabs">
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
            className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tips');
              sound.coin();
            }}
          >
            💡 Výzbroj, Vesnice & Tipy
          </button>
        </div>

        {/* TAB 1: CONTROLS */}
        {activeTab === 'controls' && (
          <div style={{ maxHeight: '490px', overflowY: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* PAUSE SECTION - HIGHLIGHTED */}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#92400E' }}>
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
                Při pauze si můžete v klidu prohlédnout svůj arzenál, úroveň a poškození zbraní, zbývající životy, 
                počet ulovených monster, nebo výpravu bezpečně ukončit a uložit získané krejcary do hospody. 
                Opětovným stiskem <strong>P</strong> se vrátíte přímo do boje!
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1E3A8A' }}>
                  🏃 Pohyb lovce po venkovské krajině
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
                Pohybujte se po ladovských loukách, zasněžených cestách i hřbitovech. Vyhýbejte se přímému střetu se 
                strašidly a udržujte si manévrovací prostor.
              </p>
            </div>

            {/* ULTIMATE */}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#B91C1C' }}>
                  ⚡ Zvláštní hrdinská schopnost (Ultimate)
                </span>
                <span className="keycap keycap-wide">Mezerník (Space)</span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Každý hrdina má jedinečnou mocnou schopnost, která se postupně nabíjí (při nabití se rozzáří ikona vpravo dole):
              </p>
              <ul style={{ margin: '6px 0 0 16px', padding: 0, fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.4 }}>
                <li><strong>Poutník:</strong> <em>Rázová vlna vrbového prutu</em> – odhodí a omráčí všechna strašidla v okolí.</li>
                <li><strong>Pasáček:</strong> <em>Prásknutí bičem</em> – bleskový výpad s vysokým zásahem.</li>
                <li><strong>Bába kořenářka:</strong> <em>Léčivý lektvar z devatera bylin</em> – okamžitě vyléčí zdraví a očistí postavu.</li>
                <li><strong>Ponocný:</strong> <em>Záře svaté lucerny</em> – oslepí noční stíny a udělí plošné poškození.</li>
                <li><strong>Kostelník:</strong> <em>Hlahol farního zvonu</em> – posvátný zvuk zažene pekelníky i kostlivce.</li>
                <li><strong>Babička a Barunka:</strong> <em>Chléb se solí a vlídné slovo</em> – zmrazí čas; působí buď jako <strong>Food</strong> (chléb nasytí) nebo <strong>Holy</strong> (vlídné slovo zažene démony) podle toho, proti čemu má daný bubák menší resist!</li>
              </ul>
            </div>

            {/* AUTO-ATTACK */}
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
                Všechny vaše zbraně (povidlové buchty, vrbový prut, česnek, svěcená voda, máselnice, koňský bič, ...) 
                <strong> útočí na nepřátele zcela automaticky</strong>! Nemusíte mířit myší – vaším úkolem je taktický 
                pohyb, sbírání krejcarů a správný výběr vylepšení při postupu na novou úroveň.
              </p>
            </div>

            {/* TOUCH & MOBILE */}
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
                a tlačítko pro spuštění schopnosti ⚡ vpravo dole. Pauzu vyvoláte kdykoliv horním tlačítkem <strong>⏸️ Pauza</strong>.
                Joystick můžete kdykoliv zapnout nebo vypnout tlačítkem v nabídce.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: OBJECTIVE & PHASES */}
        {activeTab === 'objective' && (
          <div style={{ maxHeight: '490px', overflowY: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* MAIN GOAL: SURVIVE UNTIL DAWN */}
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
                Každá úroveň v Bubákově trvá přesně <strong>5 minut (300 sekund)</strong> reálného času. 
                Pokud vydržíte naživu, v 300. sekundě třikrát hlasitě <strong>zakokrhá vesnický kohout</strong>. 
                S prvním ranním paprskem všechna strašidla ztratí svou moc, propadnou panice a rozutečou se! 
                Úroveň je tím slavnostně vyhrána.
              </p>
            </div>

            {/* DAY & NIGHT CYCLE */}
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
                ⏳ Fáze noci – jak se stupňuje nebezpečí:
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                <div style={{ background: '#FFFDF5', border: '2px solid var(--ink)', borderRadius: '6px', padding: '8px 10px' }}>
                  <div style={{ fontWeight: 900, color: '#C2410C' }}>🌅 Podvečer (0:00 - 0:45)</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>
                    Začátek výpravy. Slabší strašidýlka (šotci, rarachové). Ideální čas na nasbírání prvních krejcarů a vylepšení.
                  </div>
                </div>
                <div style={{ background: '#FFFDF5', border: '2px solid var(--ink)', borderRadius: '6px', padding: '8px 10px' }}>
                  <div style={{ fontWeight: 900, color: '#7C2D12' }}>🌇 Soumrak (0:45 - 1:30)</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>
                    Nastupují divoženky a kostlivci. Na zemi se začínají objevovat malované truhly a vyděšení chasníci.
                  </div>
                </div>
                <div style={{ background: '#FFFDF5', border: '2px solid var(--ink)', borderRadius: '6px', padding: '8px 10px' }}>
                  <div style={{ fontWeight: 900, color: '#312E81' }}>🌑 Půlnoc (1:30 - 3:00)</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>
                    Husté šero, noční můry a stíny. Kolem 2. minuty zaútočí první nebezpečný Mini-boss dané krajiny!
                  </div>
                </div>
                <div style={{ background: '#FFFDF5', border: '2px solid var(--ink)', borderRadius: '6px', padding: '8px 10px' }}>
                  <div style={{ fontWeight: 900, color: '#991B1B' }}>👹 Černá hodinka & Boss (3:00 - 4:45)</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>
                    Přichází hlavní vládce úrovně s unikátními útoky (mlýnské kameny, balvany, plameny, bumerang hlavy).
                  </div>
                </div>
              </div>
            </div>

            {/* BOSSES & UNLOCKING */}
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
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: '#166534' }}>
                👑 Porážka velkých bossů & Záchrana dušiček
              </h3>
              <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                V každé z 6 úrovní na vás čeká velký venkovský boss (Čert z Hrusického mlýna, Lesní Hejkal, Zkamenělý Obr, 
                Prokletý Mlynář, Bezhlavý rytíř a Tříhlavý drak). 
              </p>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#78350F' }}>
                ⭐ <strong>Královská zkratka:</strong> Skolíte-li bosse úrovně, nejenže osvobodíte cenné lidské dušičky 🏺, 
                ale rovnou se vám okamžitě odemkne další úroveň bez nutnosti plnit dílčí stopy v mlze!
              </div>
            </div>

            {/* ITEMS ON GROUND */}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.88rem', fontWeight: 700 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <KrejcarIcon size="1.25em" /> <strong>Krejcary:</strong> Trvalé mince pro rozvoj vesnice v hospodě.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CzechBuchtaIcon size="1.25em" /> <strong>Povidlové buchty:</strong> Okamžitě vyléčí +25 až +40 HP.
                </div>
                <div>✨ <strong>Zkušenostní jiskry:</strong> Plní ukazatel pro získání nové úrovně.</div>
                <div>🏺 <strong>Hrnce s dušičkami:</strong> Osvobozují zakleté lidské duše.</div>
                <div>📦 <strong>Malované truhly:</strong> Trojitý výběr zbraní a velká kupa krejcarů.</div>
                <div>🌾 <strong>Chasníci v nesnázích:</strong> Zachraňte je pro štědrý krejcarový bonus.</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEAPONS, TAVERN & SURVIVAL TIPS */}
        {activeTab === 'tips' && (
          <div style={{ maxHeight: '490px', overflowY: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* TAVERN META PROGRESSION */}
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
              <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Žádný sesbíraný krejcar nepřijde nazmar! Po každé výpravě navštivte hospodu a investujte do vesnických řemesel:
              </p>
              <ul style={{ margin: '0 0 0 16px', padding: 0, fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.4 }}>
                <li>⚒️ <strong>Kovárna mistra kováře:</strong> Zvyšuje trvalé poškození všech zbraní (+10 % za každou úroveň).</li>
                <li>🥖 <strong>Pekárna babičky:</strong> Zvyšuje maximální počet životů vašeho lovce.</li>
                <li>🔔 <strong>Kostelní zvonice:</strong> Rozšiřuje dosah přitahování krejcarů a koláčů na dálku.</li>
                <li>🌿 <strong>Bylinkářství báby kořenářky:</strong> Zrychluje běh a hbitost lovce.</li>
                <li>🍺 <strong>Pivovarská tekutá kuráž:</strong> Zajišťuje trvalou regeneraci zdraví (+1 HP každých 5 sekund)!</li>
              </ul>
            </div>

            {/* BEST SURVIVAL TIPS */}
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
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#166534' }}>
                🧠 Zlaté rady pro přežití nejtemnější noci:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.35 }}>
                <div>
                  🔄 <strong>Nikdy nezůstávejte stát na místě:</strong> Pohybujte se v širokých elipsách kolem shluků monster. Zabráníte tím obklíčení rychlými šotky či divoženkami.
                </div>
                <div>
                  🧄 <strong>Kombinujte zbraně na dálku i na blízko:</strong> Česnekový věnec nebo máselnice vytvoří ochranný kruh kolem lovce, zatímco buchty, prak a vrbový prut kosí vzdálené nepřátele.
                </div>
                <div>
                  ⏸️ <strong>Nebojte se využívat pauzu [P]:</strong> Když je na obrazovce příliš mnoho projektilů nebo strašidel, stiskněte <strong>P</strong>. Zjistíte, kolik vám zbývá životů, kde se nachází cíl a naplánujete další manévr.
                </div>
                <div>
                  🏆 <strong>Plňte Syslovské výzvy v Síni slávy:</strong> Za splnění úkolů rychtáře (např. zahnání 100 vodníků nebo dosažení 3. minuty) získáte stovky extra krejcarů do pokladny.
                </div>
                <div>
                  👥 <strong>Zkoušejte různé lovce:</strong> Pasáček je velmi rychlý, Kořenářka léčí bylinkami a Babička s Barunkou dokáží vlídným slovem zastavit čas!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button
            className="lada-btn"
            style={{ padding: '10px 32px', fontSize: '1.15rem', background: 'var(--blood-red)' }}
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
