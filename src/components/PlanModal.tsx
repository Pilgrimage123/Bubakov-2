import React, { useState } from 'react';
import { sound } from '../audio';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'plan' | 'changelog';
}

export const PlanModal: React.FC<PlanModalProps> = ({ isOpen, onClose, defaultTab = 'plan' }) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'changelog'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="overlay" style={{ zIndex: 35 }}>
      <div className="panel" style={{ maxWidth: '880px', width: '95%' }}>
        <h2>📜 Plán změn a kronika Bubákova</h2>
        <p style={{ fontWeight: 700, fontSize: '1rem', marginTop: '-6px', marginBottom: '14px', color: 'var(--parchment)' }}>
          Přehled všech provedených změn, kol vývoje a zápisků v kronice Bubákova.
        </p>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('plan');
              sound.coin();
            }}
          >
            🗺️ Plán kol změn (1.–5. kolo)
          </button>
          <button
            className={`tab-btn ${activeTab === 'changelog' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('changelog');
              sound.coin();
            }}
          >
            📜 Zápisky z kroniky (Historie verzí)
          </button>
        </div>

        {activeTab === 'plan' ? (
          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            {/* 5. KOLO */}
            <div className="plan-card" style={{ border: '4px solid var(--leaf-green)', color: '#000000' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>5. KOLO ZMĚN (v5.0.0 – Dokončeno & aktivní)</h3>
                <span className="plan-badge-done">Aktivní ve hře</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  🗺️ <strong style={{ color: '#000000' }}>Fáze 1 – Datově řízený arzenál a 32 lidových strašidel:</strong> Kompletní ladovský arzenál zbraní (Kynuté makové koláče, Horké brambory z popela, Včelí roj z úlu, Dřevěný cep na obilí, Kropenka se svěcenou vodou) a 32 strašidel rozčleněných do 8 folklorních kategorií.
                </li>
                <li style={{ color: '#000000' }}>
                  ☀️ <strong style={{ color: '#000000' }}>Fáze 2 – Cyklus Poledne až Půlnoc & Kuropění:</strong> Výslovné fáze dne v horním HUDu (Poledne, Odpoledne, Klekání & Soumrak, Hluboká noc, Půlnoční hodina, Kuropění). Atmosférické tónování oblohy. Přežijte 6 minut až do zakokrhání kohouta!
                </li>
                <li style={{ color: '#000000' }}>
                  🧪 <strong style={{ color: '#000000' }}>Fáze 3 – Lékárničky a čistá ekonomika mincí:</strong> Svatovítské léčivé balzámy (+30 HP) a pečené koláče (+15 HP) padající z nepřátel. Nominální mince: Krejcar (1 🪙), Stříbrňák (5 🪙), Tolar (15 🪙).
                </li>
                <li style={{ color: '#000000' }}>
                  📖 <strong style={{ color: '#000000' }}>Fáze 4 – Velký Bestiář a Síň slávy:</strong> Plně filtrovatelný bestiář se všemi 32 strašidly a rozšířená Síň slávy o nové venkovské trofeje s odměnami do trvalé pokladny.
                </li>
                <li style={{ color: '#000000' }}>
                  🏘️ <strong style={{ color: '#000000' }}>Fáze 5 – Bubákov jako místo (Rostoucí vesnice):</strong> Interaktivní vesnice s animovanými vinětami cechů, kde ochočená strašidla pomáhají péct chleba, strašit na polích, točit mlýnem a zpevňovat hradby.
                </li>
              </ul>
            </div>

            {/* 4. KOLO */}
            <div className="plan-card" style={{ border: '3px solid var(--wood-dark)', color: '#000000' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>4. KOLO ZMĚN (v4.4.0 – Dokončeno)</h3>
                <span className="plan-badge-done">Aktivní ve hře</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  📯 <strong style={{ color: '#000000' }}>Postava Ponocný:</strong> Svatá záře lucerny nepřetržitě zraňuje blízká strašidla.
                </li>
                <li style={{ color: '#000000' }}>
                  🐕 <strong style={{ color: '#000000' }}>Schopnost Noční roh & Voříšek:</strong> Zvuk rohu zažene strašidla v panice a věrný pes Voříšek kouše nepřátele.
                </li>
                <li style={{ color: '#000000' }}>
                  🌲 <strong style={{ color: '#000000' }}>Boss Půlnoční Hejkal:</strong> Obří lesní titán obrostlý mechem s vlastním ukazatelem zdraví.
                </li>
                <li style={{ color: '#000000' }}>
                  🏆 <strong style={{ color: '#000000' }}>Síň slávy a trofeje v hospodě:</strong> Stálé odměny za hrdinské činy.
                </li>
                <li style={{ color: '#000000' }}>
                  🪓 <strong style={{ color: '#000000' }}>Kovaná halapartna:</strong> Drtivý sečný oblouk s vysokým odhozením.
                </li>
              </ul>
            </div>

            {/* 3. KOLO */}
            <div className="plan-card" style={{ border: '3px solid var(--wood-dark)', color: '#000000' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>3. KOLO ZMĚN (v4.3.0 – Dokončeno)</h3>
                <span className="plan-badge-done">Aktivní ve hře</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  ❄️ <strong style={{ color: '#000000' }}>Zimní ladovská edice:</strong> Přepínač na zasněženou krajinu, chaloupky a sněhuláky.
                </li>
                <li style={{ color: '#000000' }}>
                  ☃️ <strong style={{ color: '#000000' }}>Sněhová koule:</strong> Mrazivá zbraň zpomalující nepřátele ledovým chladem.
                </li>
                <li style={{ color: '#000000' }}>
                  🌪️ <strong style={{ color: '#000000' }}>Zimní Meluzína:</strong> Rychlý větrný duch kroužící ve vánici.
                </li>
                <li style={{ color: '#000000' }}>
                  🌾 <strong style={{ color: '#000000' }}>Záchrana chasníka Kuby:</strong> Spojenec s prakem v aréně.
                </li>
              </ul>
            </div>

            {/* 1. & 2. KOLO */}
            <div className="plan-card" style={{ border: '3px solid var(--wood-dark)', color: '#000000' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>1. & 2. KOLO ZMĚN (v4.1.0 & v4.2.0 – Dokončeno)</h3>
                <span className="plan-badge-done">Aktivní ve hře</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>🕹️ <strong style={{ color: '#000000' }}>Virtuální dotykový joystick:</strong> Plovoucí dotykové ovládání pro mobily a tablety.</li>
                <li style={{ color: '#000000' }}>🌿 <strong style={{ color: '#000000' }}>Bába kořenářka:</strong> Léčivý bylinný dým a věnec Devatery kvítí.</li>
                <li style={{ color: '#000000' }}>👹 <strong style={{ color: '#000000' }}>Boss Pekelný Čert:</strong> Vstup velkého čerta do arény.</li>
                <li style={{ color: '#000000' }}>🏺 <strong style={{ color: '#000000' }}>Vodníkovy hrníčky dušiček:</strong> Osvobození duší přináší požehnání rychlosti.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="changelog-list" style={{ maxHeight: '450px', overflowY: 'auto', color: '#000000' }}>
            <h4 style={{ color: '#000000' }}>v5.0.0 – 5. kolo: Velké rozšíření arzenálu, cyklus Poledne až Půlnoc a vesnice Bubákov</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Nový arzenál zbraní:</strong> Makový koláč, horký brambor, včelí roj, dřevěný cep a kropenka.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>32 lidových strašidel:</strong> Polednice, Klekánice, Divoženka, Skalní obr, Plivník, Šotek a další.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Cyklus dne a noci:</strong> Plynulý přechod od Poledne až po ranní Kuropění (6 minut přežití).</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Léčivé lahvičky a koláče:</strong> Vzácné předměty na zemi obnovující zdraví.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Živá vesnice:</strong> Prohlížejte a rozšiřujte vesnici Bubákov přímo v hospodě.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Export hry (HTML i TXT):</strong> Možnost stažení kompletního HTML kódu hry do offline souboru .html i do textového formátu .txt pro snadné kopírování a zálohování.</li>
            </ul>

            <h4 style={{ color: '#000000' }}>v4.4.0 – Ponocný, Půlnoční Hejkal a Síň slávy</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Ponocný s lucernou:</strong> Posvátná záře odhánějící a pálící noční havěť.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Troubení na roh & Voříšek:</strong> Zvuk rohu způsobí paniku a věrný pes Voříšek kouše nepřátele.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Půlnoční Hejkal:</strong> Lesní gigant s vlastním ukazatelem zdraví v aréně.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Síň slávy:</strong> Trvalé trofeje s odměnami v hospodské pokladně.</li>
            </ul>

            <h4 style={{ color: '#000000' }}>v4.3.0 – Zimní ladovská edice a záchrana chasníka</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Zimní krajina:</strong> Zasněžené chaloupky, ploty, sněhuláci a padající vločky.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Mrazivá sněhová koule:</strong> Zpomalování nepřátel v mrazu.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Zimní Meluzína:</strong> Rychlý větrný duch kroužící po bojišti.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Pomocník chasník Kuba:</strong> Bojuje prakem po vašem boku po osvobození.</li>
            </ul>

            <h4 style={{ color: '#000000' }}>v4.2.0 – Bába kořenářka a hrníčky dušiček</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Bába kořenářka:</strong> Léčivý bylinný dým, nůše na zádech a očistné kadidlo.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Devatery kvítí:</strong> Ochranný věnec bylin rotující kolem lovce.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Hrníčky dušiček:</strong> Osvobozování polapených duší s rychlostním bonusem.</li>
            </ul>

            <h4 style={{ color: '#000000' }}>v4.1.0 – Dotykový joystick pro mobilní zařízení</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Virtuální joystick:</strong> Ergonomické 360° ovládání pro mobily i tablety.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Dotyková tlačítka:</strong> Samostatné spouštění ultimátní schopnosti jedním klepnutím.</li>
            </ul>
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          <button className="lada-btn" onClick={onClose}>
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
