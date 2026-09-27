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
            🗺️ Plán kol změn (1.–8. kolo)
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
            {/* 8. KOLO - PAUZA HRY, BLESKY SV. ELIÁŠE & MISTROVSKÉ TROFEJE */}
            <div className="plan-card" style={{ border: '4px solid #1E3A8A', color: '#000000', background: '#EFF6FF' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>8. KOLO ZMĚN (v8.0.0 – Pauza hry s inventářem, blesk sv. Eliáše & mistrovské trofeje)</h3>
                <span className="plan-badge-done" style={{ background: '#1E3A8A', color: '#FFFFFF' }}>Právě nasazeno</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  ⏸️ <strong>Pauza hry s přehledem výbavy („Odpočinek u milníku“):</strong> Kdykoliv během výpravy stiskněte klávesu <code>Esc</code> nebo <code>P</code>, či klepněte na tlačítko ⏸️ v horním rohu obrazovky. Zobrazí se pergamenové okno s kompletní inventurou nesených zbraní, jejich úrovněmi a popisem, statistikami přežití i možností bezpečně ustoupit do hospody.
                </li>
                <li style={{ color: '#000000' }}>
                  ⚡ <strong>Bouřkový blesk svatého Eliáše:</strong> V nočních hodinách a při soumraku může do arény s burácivým hromem sjet posvátný blesk! Spálí shluk dotírajících strašidel a na okamžik ozáří temná ladovská pole.
                </li>
                <li style={{ color: '#000000' }}>
                  🏆 <strong>Mistrovské trofeje v Síni slávy:</strong> Získejte štědré odměny za odemčení 5 zbraní v kovářské dílně, shromáždění všech 4 hrdinů družiny, pokoření Skalního obra a přežití úderu blesku!
                </li>
                <li style={{ color: '#000000' }}>
                  🔊 <strong>Zvukový syntezátor pro hrom, pauzu a návrat do boje:</strong> Nové autentické procedurální zvukové efekty Web Audio API pro atmosférický hromobití a přechody stavu.
                </li>
              </ul>
            </div>

            {/* 7. KOLO - POSTUPNÉ ODEMYKÁNÍ ZBRANÍ */}
            <div className="plan-card" style={{ border: '4px solid #E06D29', color: '#000000', background: '#FFF7ED' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>7. KOLO ZMĚN (v7.0.0 – Postupné odemykání zbraní & Zbrojnice)</h3>
                <span className="plan-badge-done" style={{ background: '#E06D29', color: '#FFFFFF' }}>Dokončeno</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  ⛓️ <strong>Přísné sekvenční odemykání zbraní i lovců:</strong> Nový lovec se nikdy nezačne odemykat, dokud není plně odemčen lovec před ním (Poutník ➔ Pasáček ➔ Bába kořenářka ➔ Ponocný). Stejné pravidlo platí pro zamčené zbraně v kovářské dílně (Vidle ➔ Halapartna ➔ Cep ➔ Byliny ➔ Sněhová koule ➔ Koláč ➔ Brambor ➔ Včely ➔ Svěcená voda).
                </li>
                <li style={{ color: '#000000' }}>
                  ⚔️ <strong>Uzamčení zbraní kromě Rákosky a Povidlových buchet:</strong> Všech 9 ostatních zbraní je na začátku uzamčeno a postupně se odemyká plněním tematických výzev kováře. Kovář začne pracovat na nové zbrani teprve po ukování předchozí.
                </li>
                <li style={{ color: '#000000' }}>
                  🕵️ <strong>Třístupňové odhalování identity zbraní (25 %, 50 %, 75 %):</strong>
                  Zbraně začínají jako tajemné siluety v kouři (???). Při 25 % se odhalí první stopa a část názvu, při 50 % detailní skica s poškozením a mechanikou, při 75 % téměř ukovaná zbraň a při 100 % se trvale zařadí do výběru vylepšení na nové úrovni!
                </li>
                <li style={{ color: '#000000' }}>
                  🗡️ <strong>Nová interaktivní Zbrojnice a Arzenál Bubákova:</strong> Přehledné okno zbrojnice s filtry (všechny, odemčené, uzamčené), živými počítadly zahnadých cílových potvor pro každou zbraň a pergamenovým detailem odhalování.
                </li>
              </ul>
            </div>

            {/* 6. KOLO - POSTUPNÉ ODEMYKÁNÍ LOVCŮ */}
            <div className="plan-card" style={{ border: '4px solid var(--mustard)', color: '#000000', background: '#FFFBEB' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>6. KOLO ZMĚN (v6.0.0 – Postupné odemykání lovců & stopy)</h3>
                <span className="plan-badge-done" style={{ background: 'var(--mustard)', color: 'var(--ink)' }}>Dokončeno</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  🔒 <strong>Uzamčení lovců kromě Poutníka:</strong> Poutník je výchozím hrdinou. Pasáček, Bába kořenářka i Ponocný jsou zpočátku zahaleni tajemstvím a odemykají se splněním náročných tematických výzev (zahánění vybraných nepřátel z pastvin, rybníků a nočních stodol).
                </li>
                <li style={{ color: '#000000' }}>
                  🕵️ <strong>Postupné odhalování identity (25 %, 50 % a 75 %):</strong>
                  Identity lovců jsou na začátku skryty jako neprostupné stínové siluety (???). Při 25 % se odhalí první stopa a obrys postavy, při 50 % detailní uhelná kresba s odhalenou zbraní a při 75 % téměř plné barvy s odhalením jména a speciální schopnosti!
                </li>
                <li style={{ color: '#000000' }}>
                  📊 <strong>Interaktivní sledování postupu a cílových monster:</strong> Každá karta v nabídce zobrazuje ukazatel postupu s milníky 25 %, 50 %, 75 %, 100 % a přesný počet zahnadých cílových potvor. Kliknutím na zamčenou kartu se otevře pergamenová kronika s podrobnostmi výzvy.
                </li>
              </ul>
            </div>

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
            <h4 style={{ color: '#000000' }}>v8.0.0 – 8. kolo: Pauza hry, blesky sv. Eliáše, mistrovské trofeje a nové zvuky</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Pauza s inventářem výbavy („Odpočinek u milníku“):</strong> Stisknutím <code>Esc</code> / <code>P</code> nebo klepnutím na tlačítko ⏸️ lze hru kdykoliv pozastavit, prohlédnout aktuální zbraně, jejich úrovně, poškození a statistiky, nebo bezpečně ukončit výpravu a sečíst skóre.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Bouřkový blesk svatého Eliáše:</strong> Příležitostný posvátný blesk za doprovodu burácivého hromu udeří do bojiště a sežehne zástupy bubáků.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Nové mistrovské trofeje:</strong> Síň slávy byla rozšířena o 4 nové výzvy: Mistr vesnické zbrojnice, Slavná vesnická družina, Pokořitel sázavského obra a Blesk svatého Eliáše.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Procedurální Web Audio efekty:</strong> Realistické ladění hromu, pozastavení a pokračování hry.</li>
            </ul>

            <h4 style={{ color: '#000000' }}>v7.0.0 – 7. kolo: Postupné odemykání zbraní a kovářská Zbrojnice</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Sekvenční odemykání zbraní:</strong> Zbraně (kromě Povidlových buchet a Rákosky) jsou na začátku uzamčeny a kovář na nich pracuje přísně postupně podle řady (Vidle ➔ Halapartna ➔ Cep ➔ Byliny ➔ Sněhová koule ➔ Koláč ➔ Brambor ➔ Včely ➔ Svěcená voda).</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Třístupňové odhalování identity:</strong> Milníky 25 %, 50 % a 75 % odhalují jméno, nákres zbraně i bojové statistiky.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Interaktivní Zbrojnice (Arzenál):</strong> Nové modální okno s filtry, přehlednými kartami a živými počítadly.</li>
            </ul>

            <h4 style={{ color: '#000000' }}>v6.0.0 – 6. kolo: Postupné sekvenční odemykání lovců a stopy</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Sekvenční odemykání hrdinů:</strong> Poutník je výchozí, Pasáček se odemyká zaháněním vodníků a polednic, Bába kořenářka po Pasáčkovi a Ponocný jako vrcholný strážce noci.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Stínové siluety a uhelné kresby:</strong> Postupné odhalování podoby lovců v nabídce podle procentuálního postupu.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Pergamenový detail lovce:</strong> Možnost prohlédnout si cílové nepřátele a indicie pro každého zamčeného hrdinu.</li>
            </ul>

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
