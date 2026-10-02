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
            🗺️ Plán kol změn (1.–13. kolo)
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
            {/* 15. KOLO - TESTOVACÍ MÓD & VYMAZAT POSTUP */}
            <div className="plan-card" style={{ border: '4px solid #7C3AED', color: '#000000', background: '#F5F3FF' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>15. KOLO ZMĚN (v15.0.0 – Testovací mód Sandbox & Tlačítko Vymazat postup)</h3>
                <span className="plan-badge-done" style={{ background: '#7C3AED', color: '#FFFFFF' }}>Dokončeno & Aktivní</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  🧪 <strong>Testovací mód (Sandbox):</strong> Možnost vybrat jakéhokoliv ze 6 lidových hrdinů (Poutník, Pasáček, Bába kořenářka, Ponocný, Kostelník, Babička a Barunka) na libovolné ze 6 úrovní bez nutnosti jejich odemykání. Navíc lze libovolně navolit libovolné startovní zbraně (včetně více zbraní najednou) a nastavit jejich úrovně od 1 až do 10 s rychlými předvolbami arzenálu!
                </li>
                <li style={{ color: '#000000' }}>
                  🗑️ <strong>Tlačítko Vymazat postup s potvrzovacím dialogem:</strong> Přímo v hlavní nabídce i v hospodě je přidáno tlačítko pro bezpečné vymazání postupu. Po potvrzení uzamkne všechny odemykatelné hrdiny, úrovně i zbraně a vrátí veškeré upgrady vesnice, pokladnu, dušičky i bestiář zpět na nulu.
                </li>
              </ul>
            </div>

            {/* 14. KOLO - PAUZA KLÁVESOU P & OVLÁDÁNÍ HRY V MENU A PRŮVODCE */}
            <div className="plan-card" style={{ border: '4px solid #1D4ED8', color: '#000000', background: '#EFF6FF' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>14. KOLO ZMĚN (v14.0.0 – Pauza klávesou P, tlačítko Ovládání hry & detailní průvodce venkovského lovce)</h3>
                <span className="plan-badge-done" style={{ background: '#1D4ED8', color: '#FFFFFF' }}>Dokončeno & Aktivní</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  ⏸️ <strong>Pauza klávesou P i Esc:</strong> Možnost kdykoliv během hraní stiskem klávesy <code>P</code> (nebo <code>Esc</code>) okamžitě pozastavit hru a bezpečně si odpočinout. V pauze se zobrazuje kompletní arzenál se statistikami poškození, čas přežití a možnost sečíst skóre do hospody. Opětovný stisk klávesy <code>P</code> vrací lovce do boje.
                </li>
                <li style={{ color: '#000000' }}>
                  🎮 <strong>Tlačítko Ovládání hry v hlavním menu i hospodě:</strong> Přímo v hlavní nabídce i v hospodě U Černého kocoura je nově umístěno výrazné modré tlačítko <code>🎮 Ovládání hry</code>.
                </li>
                <li style={{ color: '#000000' }}>
                  📜 <strong>Komplexní ilustrovaný průvodce ovládáním a cílem hry (ControlsModal):</strong>
                  Detailní rozpis kláves (WASD, šipky, P, Mezerník), vysvětlení automatických útoků v ladovském survivors stylu, popis dotykového joysticku, přehled všech 5 fází noci až do ranního kuropění kohouta (300 s), tipy na přežití a návod k rozvoji vesnice a hospody.
                </li>
              </ul>
            </div>

            {/* 13. KOLO - ÚROVNĚ 4–6, 10 NOVÝCH MONSTER, ODMYKÁNÍ A BOSSÍ MECHANIKY */}
            <div className="plan-card" style={{ border: '4px solid #166534', color: '#000000', background: '#F0FDF4' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>13. KOLO ZMĚN (v13.0.0 – Úrovně 4–6, 10 nových monster, odemykání krajin & bossí mechaniky)</h3>
                <span className="plan-badge-done" style={{ background: '#166534', color: '#FFFFFF' }}>Dokončeno & Aktivní ve hře</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  🗺️ <strong>Tři zbrusu nové ladovské úrovně (Úrovně 4–6):</strong> Rozšíření <code>GameLevelId</code> z 1–3 na 1–6. Úroveň 4: Staré hamry a Čertův mlýn; Úroveň 5: Pustá Hláska a Zlenické podhradí; Úroveň 6: Dračí sluj pod Melechovskou skálou. Každá s vlastním ladovským motivem, počasím, atmosférou i dekorem.
                </li>
                <li style={{ color: '#000000' }}>
                  👹 <strong>Velký Bestiář rozšířen na 42 druhů strašidel:</strong> Doplněno 10 nových lidových monster včetně kompletních Ladovských kreseb, statistik, slabin, předností, folklorního lore a nebezpečnosti: Zbojník z hamrů, Jiskřivec, Ohnivý pes, Bílá paní, Zbrojnoš, Prokletý Sněhulák, Noční můra a 3 titánští bossové.
                </li>
                <li style={{ color: '#000000' }}>
                  ⚔️ <strong>Unikátní interaktivní bossí útoky a mechaniky:</strong> Prokletý Mlynář vrhá rotující žulové mlýnské kameny, valí dravou povodňovou vlnu a oslepuje moučným oblakem; Bezhlavý rytíř metá svou odraženou hlavu jako bumerang; Tříhlavý líný Drak chrlí kužely plamene a způsobuje pád ostrých rampouchů ze stropu sluje.
                </li>
                <li style={{ color: '#000000' }}>
                  🔐 <strong>Sekvenční odemykání všech 6 úrovní & Královská zkratka:</strong> Rozšířen <code>LEVEL_ORDER</code> na [1, 2, 3, 4, 5, 6]. Postupné odhalování stop v mlze (0 %, 25 %, 50 %, 75 %, 100 %) nebo okamžité odemčení skolením bosse předchozí úrovně.
                </li>
                <li style={{ color: '#000000' }}>
                  🎯 <strong>Vybalancovaný bodový systém dropů:</strong> Doplněny hodnoty <code>ENEMY_POINTS</code> pro všech 10 nových monster (Zbojník 135, Jiskřivec 95, Ohnivý pes 175, Bílá paní 185, Zbrojnoš 290, Sněhulák 220, Noční můra 110, Prokletý Mlynář 5500, Bezhlavý rytíř 6800 a Tříhlavý drak 9900).
                </li>
                <li style={{ color: '#000000' }}>
                  👥 <strong>Nová družina hrdinů (Hrobník & Babička s Barunkou):</strong> Rozšíření sekvenční řady hrdinů o Hrobníka se svatou lucernou a lopatou a Babičku s Barunkou z Ratibořic přinášející vánkem vlídnosti záchranu celé vesnici.
                </li>
              </ul>
            </div>

            {/* 12. KOLO - 100% KOMPLETNÍ OFFLINE HRA V TXT I HTML A PLNÁ UPRAVITELNOST PRO CLAUDE / AI */}
            <div className="plan-card" style={{ border: '4px solid #1D4ED8', color: '#000000', background: '#EFF6FF' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>12. KOLO ZMĚN (v12.0.0 – 100% kompletní offline hra i plná upravitelnost pro AI/Claude & Původní zdrojáky)</h3>
                <span className="plan-badge-done" style={{ background: '#1D4ED8', color: '#FFFFFF' }}>Dokončeno</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  📄 <strong>Garance stoprocentně kompletního a soběstačného souboru:</strong>
                  Stahovaný soubor hry (ať už jako <code>.html</code> nebo jako <code>.txt</code>) obsahuje naprosto kompletní, 100% samostatnou hru připravenou nejen k okamžitému offline hraní, ale i k plnohodnotným úpravám libovolným vývojářem nebo AI modelem (Claude, GPT)!
                </li>
                <li style={{ color: '#000000' }}>
                  🤖 <strong>Čistý neminifikovaný kód & Příručka pro Claude:</strong>
                  Kód v souboru již není nečitelný minifikovaný shluk. Všechny funkce, proměnné i datové struktury (<code>WEAPONS</code>, <code>ENEMY_TYPES</code>, <code>updateGame</code>) mají plná jména a na začátku souboru je podrobný návod pro Claude a programátory, jak do hry přidat nové monstrum, zbraň či upravit ladovský canvas renderer.
                </li>
                <li style={{ color: '#000000' }}>
                  📦 <strong>Všechny původní zdrojové kódy přímo v souboru (Embedded Source Tree):</strong>
                  Soubor obsahuje kompletní strom 27 původních zdrojových souborů projektu (TypeScript, React, CSS) a utilitu <code>window.BUBAKOV.exportSources()</code> pro okamžitý export celého projektu z konzole prohlížeče.
                </li>
                <li style={{ color: '#000000' }}>
                  🎮 <strong>Spuštění pouhým přejmenováním:</strong>
                  Soubor <code>bubakov_hra_ladovska_edice.txt</code> stačí přejmenovat na <code>.html</code> a otevřít v jakémkoliv prohlížeči zcela bez internetu a serveru.
                </li>
              </ul>
            </div>

            {/* 11. KOLO - KONTRAST PÍSMA, ZÁSADY DESIGNU A POSÍLENÍ NEPŘÁTEL */}
            <div className="plan-card" style={{ border: '4px solid #166534', color: '#000000', background: '#F0FDF4' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>11. KOLO ZMĚN (v11.0.0 – Vysoký kontrast písma, zásady designu & +80 % útok i zdraví nepřátel)</h3>
                <span className="plan-badge-done" style={{ background: '#166534', color: '#FFFFFF' }}>Dokončeno</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  👁️ <strong>Zásada bezvadné viditelnosti a vysokého kontrastu písma:</strong>
                  Do zásad designu hry (`DESIGN_PRINCIPLES.md`) bylo zakotveno neměnné pravidlo: Na vysokou viditelnost a bezvadný kontrast písma je vždy třeba dbát. Veškeré texty, štítky, čísla a popisy v celé aplikaci (v HUDu, panelech, Zbrojnici, Bestiáři, postupu lovců, úrovní i hospodě) mají zaručen ostrý kontrast: tmavý sytý inkoust na světlém pergamenu a jasné písmo se stínem na tmavém dřevě.
                </li>
                <li style={{ color: '#000000' }}>
                  📜 <strong>Pergamenové destičky a orámování HUDu:</strong>
                  Ukazatele času, fází dne, mincí, dušiček a počtu zahnadých nepřátel v horní liště HUDu dostaly samostatnou parchmentovou desku s tmavým inkoustovým orámováním, aby byl text bezchybně čitelný za všech fází dne (od jasného poledne až po temnou noc).
                </li>
                <li style={{ color: '#000000' }}>
                  ⚔️ <strong>Zvýšení útoku a zdraví všech nepřátel o 80 %:</strong>
                  Všech 35 druhů ladovských běsů, vodníků, čertů, hejkalů i skalních obrů má trvale zvýšeno maximální zdraví (HP) i sílu útoku (damage) o plných 80 % pro náročnější a napínavější taktickou hratelnost!
                </li>
              </ul>
            </div>

            {/* 10. KOLO - POSTUPNÉ ODHALOVÁNÍ STRAŠIDEL V BESTIÁŘI */}
            <div className="plan-card" style={{ border: '4px solid #78350F', color: '#000000', background: '#FEF3C7' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>10. KOLO ZMĚN (v10.0.0 – Postupné odhalování strašidel v Bestiáři jako u lovců a úrovní)</h3>
                <span className="plan-badge-done" style={{ background: '#78350F', color: '#FFFFFF' }}>Dokončeno</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  📖 <strong>Pětistupňové odhalování strašidel (0 %, 25 %, 50 %, 75 %, 100 %):</strong>
                  Všechna lidová strašidla a diblíci jsou v Bestiáři zpočátku zahaleni hustou mlhou s otazníkem (???). Postupným zaháněním v herních výpravách se odkrývají stopy v kronice: silueta a původ (25 %), slabiny a odměny v mincích (50 %), přednosti a rychlost pohybu (75 %) a při 100 % kompletní folklorní zápis s plnobarevnou Ladovskou ilustrací!
                </li>
                <li style={{ color: '#000000' }}>
                  🎨 <strong>Vizuální fáze v kruhovém medailonu (Canvas filtry):</strong>
                  Stejně jako u lovců se ilustrace strašidla vizuálně proměňuje z tajemného černého stínu s otazníkem (0 %), přes uhelnou siluetu (25 %), sépiový náčrt (50 %) a mystický závoj (75 %) až po plně oživenou animaci (100 %).
                </li>
                <li style={{ color: '#000000' }}>
                  📊 <strong>Ukazatel výzkumu a přehled kroniky:</strong>
                  Každé strašidlo má vlastní interaktivní teploměr výzkumu s milníky (0 %, 25 %, 50 %, 75 %, 100 %) a počítadlem zahnání. Horní lišta Bestiáře nově ukazuje celkový počet spatřených i zcela probádaných tvorů ze všech 32 druhů.
                </li>
              </ul>
            </div>

            {/* 9. KOLO - POSTUPNÉ ODHALOVÁNÍ ÚROVNÍ A TAJEMSTVÍ KRAJINY */}
            <div className="plan-card" style={{ border: '4px solid #065F46', color: '#000000', background: '#ECFDF5' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>9. KOLO ZMĚN (v9.0.0 – Postupné odhalování úrovní jako u lovců)</h3>
                <span className="plan-badge-done" style={{ background: '#065F46', color: '#FFFFFF' }}>Dokončeno</span>
              </div>
              <ul className="plan-items" style={{ color: '#000000' }}>
                <li style={{ color: '#000000' }}>
                  🕵️ <strong>Postupné odhalování nových úrovní (25 %, 50 %, 75 % a 100 %):</strong>
                  Nové úrovně jsou na počátku zahaleny do neproniknutelné mlhy a tajemství (???). Postupným průzkumem se při 25 % odhalí první stopa, počasí a obrys krajiny, při 50 % zřetelná stezka, přední příšery a mini-bossové, při 75 % téměř celá mapa s odhalením hlavního bosse a při 100 % se brána úrovně trvale otevře!
                </li>
                <li style={{ color: '#000000' }}>
                  ⛓️ <strong>Sekvenční řád průzkumu:</strong>
                  Úroveň 3 (Ladovská zima na Melechově) čeká v pořadí, dokud není plně probádána a otevřena Úroveň 2 (Starý hřbitov a Hrusický hvozd).
                </li>
                <li style={{ color: '#000000' }}>
                  👑 <strong>Dvojí cesta k otevření (Královská zkratka vs. Průzkum):</strong>
                  Každou úroveň lze otevřít buď postupným zaháněním stanoveného počtu potvor z předchozí úrovně, NEBO okamžitě skolením hlavního bosse (Pekelný Čert otevře 2. úroveň, Půlnoční Hejkal otevře 3. úroveň)!
                </li>
                <li style={{ color: '#000000' }}>
                  📜 <strong>Interaktivní pergamenový detail úrovně (Kronika průzkumu):</strong>
                  Klepnutím na kartu zamčené či odemykané úrovně se zobrazí pergamenová kronika s ukazatelem zahnadých potvor, nápovědami k počasí, bossovi a přehledem milníků.
                </li>
              </ul>
            </div>

            {/* 8. KOLO - PAUZA HRY, BLESKY SV. ELIÁŠE & MISTROVSKÉ TROFEJE */}
            <div className="plan-card" style={{ border: '4px solid #1E3A8A', color: '#000000', background: '#EFF6FF' }}>
              <div className="plan-header">
                <h3 style={{ color: '#000000' }}>8. KOLO ZMĚN (v8.0.0 – Pauza hry s inventářem, blesk sv. Eliáše & mistrovské trofeje)</h3>
                <span className="plan-badge-done" style={{ background: '#1E3A8A', color: '#FFFFFF' }}>Dokončeno</span>
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
                  ⚔️ <strong>Uzamčení zbraní kromě Vrbového prutu a Povidlových buchet:</strong> Všech 9 ostatních zbraní je na začátku uzamčeno a postupně se odemyká plněním tematických výzev kováře. Kovář začne pracovat na nové zbrani teprve po ukování předchozí.
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
                  🧪 <strong style={{ color: '#000000' }}>Fáze 3 – Lékárničky a čistá ekonomika mincí:</strong> Svatovítské léčivé balzámy (+30 HP) a pečené koláče (+15 HP) padající z nepřátel. Nominální mince: Krejcar (1 kr.), Stříbrňák (5 kr.), Tolar (15 kr.).
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
            <h4 style={{ color: '#000000' }}>v16.0.0 – 16. kolo: Audit bestiáře a sjednocení počtu zbraní
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Audit bestiáře:</strong> Datový registr <code>ENEMIES</code> obsahuje 49 položek. Rozdíl proti dřívějšímu údaji 42 není automaticky interpretován jako sedm nových základních druhů; zahrnuje také variantní/posílené nepřátele, např. Obrněného zbojníka a Krvavého kostlivce.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Sjednocení Zbrojnice:</strong> Celkový počet zbraní v UI se nově odvozuje přímo z registru <code>WEAPONS</code>. Aktuálně je registrováno 12 zbraní, takže počítadlo už nemůže zůstat na pevné hodnotě 11.</li>
            </ul>

            <h4 style={{ color: '#000000' }}>v15.0.0 – 15. kolo: Testovací mód Sandbox & Tlačítko Vymazat postup</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}>
                <strong style={{ color: '#000000' }}>Testovací mód (Sandbox):</strong> Nový dedikovaný režim s volným přístupem ke všem 6 lidovým hrdinům i všem 6 úrovním. Umožňuje libovolný výběr zbraní ze všech 12 typů s volitelným nastavením jejich úrovní od 1 až do 10 a rychlými předvolbami arzenálu.
              </li>
              <li style={{ color: '#000000' }}>
                <strong style={{ color: '#000000' }}>Tlačítko Vymazat postup s potvrzením:</strong> Možnost vymazat uložená data v prohlížeči, čímž se zamkne veškerý odemykatelný obsah (hrdinové, zbraně, úrovně) a všechny upgrady vesnice se vrátí na úroveň 0.
              </li>
            </ul>

            <h4 style={{ color: '#000000' }}>v13.0.0 – 13. kolo: Úrovně 4–6, 10 nových lidových monster, odemykání krajin & unikátní mechaniky bossů</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}>
                <strong style={{ color: '#000000' }}>Tři zbrusu nové ladovské úrovně (Úrovně 4–6):</strong> Přidána Úroveň 4: Staré hamry a Čertův mlýn (horké výhně, náhon, točící se mlýnské lopatky a padající moučný prach), Úroveň 5: Pustá Hláska a Zlenické podhradí (chmurná gotická zřícenina, kamenné hradby a noční stíny) a Úroveň 6: Dračí sluj pod Melechovskou skálou (mrazivá ledová jeskyně, sněhová vánice a spící drak).
              </li>
              <li style={{ color: '#000000' }}>
                <strong style={{ color: '#000000' }}>10 nových lidových monster (Bestiář má 42 druhů):</strong> Do hry vstoupili Zbojník z hamrů, Jiskřivec z kovadliny, Ohnivý pes, Bílá paní z hlásky, Zbrojnoš s těžkým štítem, Prokletý Sněhulák, Noční můra a trojice velkých bossů – Prokletý Mlynář, Bezhlavý rytíř a Tříhlavý líný Drak, včetně kompletních Ladovských kreseb, slabin, statistik i lore.
              </li>
              <li style={{ color: '#000000' }}>
                <strong style={{ color: '#000000' }}>Unikátní bossí útoky a mechaniky v enginu:</strong> Prokletý Mlynář vrhá valící se žulové mlýnské kameny, vyvolává dravé povodňové vlny a oslepující moučné mraky; Bezhlavý rytíř vrhá svou odraženou hlavu jako bumerang; Tříhlavý líný Drak chrlí ohnivé kužely a shazuje z klenby jeskyně ostré ledové rampouchy.
              </li>
              <li style={{ color: '#000000' }}>
                <strong style={{ color: '#000000' }}>Sekvenční odemykání 6 úrovní & Královská zkratka:</strong> Každá nová úroveň má vlastní zadání výzvy, procentuální postup (0 %, 25 %, 50 %, 75 %, 100 %) i možnost okamžitého odemčení skolením bosse předchozí úrovně.
              </li>
              <li style={{ color: '#000000' }}>
                <strong style={{ color: '#000000' }}>Bodový systém dropů pro nová monstra:</strong> Přesně vyladěné hodnoty <code>ENEMY_POINTS</code> pro dropy truhel, léčivých balzámů, koláčů, mincí a dušiček pro všech 10 nových monster.
              </li>
              <li style={{ color: '#000000' }}>
                <strong style={{ color: '#000000' }}>Nová družina hrdinů (Hrobník & Babička s Barunkou):</strong> Doplnění Hrobníka (lopata a posvátná lucerna) a Babičky s Barunkou z Ratibořic (vlídné slovo a chléb se solí) do sekvenčního odemykacího řádu hrdinů.
              </li>
            </ul>

            <h4 style={{ color: '#000000' }}>v12.0.0 – 12. kolo: 100% kompletní offline hra i plná upravitelnost pro AI (Claude) a programátory</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Garance celistvosti pro hraní i úpravy (Claude & vývojáři):</strong> Závazně zakotveno v <code>DESIGN_PRINCIPLES.md</code> i v kódu. Soubory ke stažení (HTML i TXT) obsahují kompletní offline hru a veškeré náležitosti pro snadné rozšiřování novým obsahem.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Neminifikovaný čistý kód & Vývojářská příručka:</strong> Běhový kód v souboru již není nečitelný spletenec. Všechny proměnné a funkce mají plná jména a v záhlaví souboru je podrobný návod pro Claude a programátory, kde najít a jak přidat zbraň, monstrum, bosse či upravit ladovský canvas renderer.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Plné původní zdrojové kódy přímo v souboru (Embedded Source Tree):</strong> Uvnitř souboru je zabaleno všech 27 původních TypeScript/React souborů v JSON bloku <code>bubakov-source-tree</code> s konzolovou exportní utilitou <code>window.BUBAKOV.exportSources()</code>.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Snadné offline hraní:</strong> Stažený <code>.txt</code> soubor stačí přejmenovat na <code>.html</code> a spustit v libovolném internetovém prohlížeči kdekoliv bez sítě.</li>
            </ul>

            <h4 style={{ color: '#000000' }}>v11.0.0 – 11. kolo: Zásady designu, dokonalý kontrast písma & +80 % útok i zdraví nepřátel</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Zásada bezvadné viditelnosti textu:</strong> Formálně zapsáno do zásad designu: „Na vysokou viditelnost a bezvadný kontrast písma je vždy třeba dbát!“ Přísný zákaz slabého kontrastu a vybledlých textů v jakémkoliv stavu.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Kontrastní pergamenové podložky a orámování HUDu:</strong> Všechny texty v HUDu, lištách a panelech mají zajištěn stoprocentní kontrast i při přechodu z denního světla do půlnoční tmy.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>+80 % zdraví a útok všech nepřátel:</strong> Všech 35 monster v souboru <code>enemies.ts</code> bylo posíleno o 80 % (HP i útočné číslo damage) pro náročnější výpravy.</li>
            </ul>

            <h4 style={{ color: '#000000' }}>v10.0.0 – 10. kolo: Postupné odhalování strašidel v Bestiáři jako u lovců a úrovní</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Postupné zkoumání 32 lidových strašidel (0 %, 25 %, 50 %, 75 %, 100 %):</strong> Strašidla, která hráč dosud neporazil, jsou v bestiáři zahalena rouškou tajemství (???). Postupnými zářezy se v kronice odhalují jejich slabiny, přednosti, odměny a přesné statistiky.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Postupná vizualizace v kresbě:</strong> Obrazovka kreslí strašidlo podle fáze průzkumu – od stínu s otazníkem (0 %), přes uhelnou kresbu (25 %) a sépiový náčrt (50 %) až po plnobarevný Ladovský medailon.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Počítadla výzkumu:</strong> Zobrazení celkového počtu spatřených a 100% probádaných tvorů přímo v záhlaví Bestiáře.</li>
            </ul>

            <h4 style={{ color: '#000000' }}>v9.0.0 – 9. kolo: Postupné odhalování úrovní jako u lovců</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Progresivní odhalování mapy (25 %, 50 %, 75 %, 100 %):</strong> Úrovně 2 a 3 jsou zpočátku zahaleny mlhou a tajemstvím. Splněním tematických milníků (nebo poražením bosse) se odhalují názvy, indicie, počasí, přední příšery i hlavní bossové.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Královská zkratka i postupné zářezy:</strong> Porážka Pekelného Čerta v 1. úrovni okamžitě na 100 % zpřístupní Starý hřbitov; porážka Půlnočního Hejkala ve 2. úrovni okamžitě zpřístupní Ladovskou zimu na Melechově. Pro nováčky se mapa otevírá postupným zaháněním potvor!</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Interaktivní okno Kroniky úrovní:</strong> Klepnutím na kartu úrovně se otevře pergamen s postupem, cílovými potvorami a milníky.</li>
            </ul>

            <h4 style={{ color: '#000000' }}>v8.0.0 – 8. kolo: Pauza hry, blesky sv. Eliáše, mistrovské trofeje a nové zvuky</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Pauza s inventářem výbavy („Odpočinek u milníku“):</strong> Stisknutím <code>Esc</code> / <code>P</code> nebo klepnutím na tlačítko ⏸️ lze hru kdykoliv pozastavit, prohlédnout aktuální zbraně, jejich úrovně, poškození a statistiky, nebo bezpečně ukončit výpravu a sečíst skóre.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Bouřkový blesk svatého Eliáše:</strong> Příležitostný posvátný blesk za doprovodu burácivého hromu udeří do bojiště a sežehne zástupy bubáků.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Nové mistrovské trofeje:</strong> Síň slávy byla rozšířena o 4 nové výzvy: Mistr vesnické zbrojnice, Slavná vesnická družina, Pokořitel sázavského obra a Blesk svatého Eliáše.</li>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Procedurální Web Audio efekty:</strong> Realistické ladění hromu, pozastavení a pokračování hry.</li>
            </ul>

            <h4 style={{ color: '#000000' }}>v7.0.0 – 7. kolo: Postupné odemykání zbraní a kovářská Zbrojnice</h4>
            <ul style={{ color: '#000000' }}>
              <li style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Sekvenční odemykání zbraní:</strong> Zbraně (kromě Povidlových buchet a Vrbového prutu) jsou na začátku uzamčeny a kovář na nich pracuje přísně postupně podle řady (Vidle ➔ Halapartna ➔ Cep ➔ Byliny ➔ Sněhová koule ➔ Koláč ➔ Brambor ➔ Včely ➔ Svěcená voda).</li>
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
