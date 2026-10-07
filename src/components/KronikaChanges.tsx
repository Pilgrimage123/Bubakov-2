import React from 'react';

type KronikaEntry = {
  date: string;
  title: string;
  summary: string;
  items: string[];
};

const KRONIKA: KronikaEntry[] = [
{
    date: '7. října 2026',
    title: 'Nová struktura výběru výpravy a lovce',
    summary: 'Výprava a lovec se vybírají ve dvou samostatných krocích.',
    items: [
      '🗺️ Nejprve hráč vybírá jednu ze 6 výprav/krajů na samostatné přehledové obrazovce s atmosférou, monstry, ročním obdobím, bossem a výzvami.',
      '🏹 Poté následuje samostatný výběr lovce; zvolená výprava zůstává viditelná a lze se k ní vrátit.',
      '🎨 Výběr lovců používá živé ladovské medailony a výbavu odpovídající zvolené výpravě.',
    ],}
  ,
  {
    date: '7. října 2026',
    title: 'Konsolidace Kroniky změn',
    summary: 'Kronika ve hře byla sjednocena s aktuálním vývojářským changelogem.',
    items: [
      '📜 Hráčská Kronika změn nyní vychází z aktuální historie skutečných herních změn.',
      '⚔️ Nejnovější systém zbraní, milestone upgrady a aktuální balance jsou vedeny jako herní novinky.',
      '🐛 Historické opravy, změny bossů, dropů, postav a výkonu jsou uvedeny v samostatných datovaných zápisech.',
    ],}
  ,
  {
    date: '6. října 2026',
    title: 'Zbraně, mastery a combat systém',
    summary: 'Velký zásah do progrese zbraní a combat balance.',
    items: [
      '⚔️ Čtyři hlavní zbraně mají osmirankový progression systém s milestone volbami na ranku 3, 5 a 8.',
      '💥 Standardní ranky přidávají damage, cooldown a area; milestone volby dávají speciální efekty.',
      '🧭 Tulák získává +30 flat damage ke všem zbraním.',
      '🧹 Starý mastery stav zůstává pouze kvůli kompatibilitě uložených her; nové mastery volby se negenerují.',
      '☕ Opravdová káva, Krvavé jelito, Medvědí mast, Veselá mysl a písnička, Toulavé boty a Magnetický měšec mají sjednocené aktuální hodnoty.',
      '🎁 Aktualizovány hodnoty truhel, potionů, chleba, duší a mincí.',
      '👹 Minibossové dostali vlastní škálování, resistence, HP HUD, zlatou auru a posílený damage model.',
      '🐛 Opraveny důležité části gameplay loopu: stale closure, magnetizace dropů, kontakt s nepřítelem, útěková AI, SpatialHash, projektily a boss victory logika.',
      '🎬 Pasáček a Kořenářka dostali vlastní příběhové ultimate scénky.',
      '🪵 Tulákova ultimate byla přepracována na Pověstnou sukovici.',
      '🏆 Level-up byl sjednocen na bojovou volbu + pasivní volbu + wildcard.',
      '💰 Běžná truhla má aktuálně 29 400 bodů.',
      '🧟 Registry byly auditovány: 49 enemy položek a 12 registrovaných zbraní.',
    ],}
  ,
  {
    date: '6. října 2026',
    title: 'Nové úrovně, bestiář a odemykání krajin',
    summary: 'Bubákov se rozrostl na šest krajin a dostal postupný systém průzkumu.',
    items: [
      '🗺️ Přibyly úrovně 4–6: Staré hamry a Čertův mlýn, Pustá Hláska a Zlenické podhradí a Dračí sluj pod Melechovskou skálou.',
      '👹 Bestiář byl rozšířen o nová monstra a tři výrazné titánské bossy s vlastními mechanikami.',
      '🔐 Krajiny se odemykají postupným průzkumem, případně poražením bosse předchozí úrovně.',
      '🧑‍🌾 Do družiny přibyli Kostelník a Babička, každý s vlastními zvuky a speciálními schopnostmi.',
    ],}
  ,
  {
    date: '5. října 2026',
    title: 'Pauza, ovládání a průvodce lovce',
    summary: 'Hra dostala bezpečnou pauzu a samostatný průvodce ovládáním.',
    items: [
      '⏸️ Hru lze během výpravy pozastavit klávesou P nebo Esc; pauza zobrazuje arzenál, statistiky a čas přežití.',
      '🎮 V hlavní nabídce a hospodě je dostupné tlačítko Ovládání hry.',
      '📜 Průvodce vysvětluje pohyb, automatické útoky, dotykový joystick, průběh pěti fází noci a rozvoj vesnice.',
    ],}
  ,
  {
    date: '5. října 2026',
    title: 'Sandbox a bezpečné vymazání postupu',
    summary: 'Testování hry se oddělilo od běžného postupu a přibyl úplný reset.',
    items: [
      '🧪 Sandbox umožňuje testovat libovolného lovce, krajinu, startovní zbraně a jejich úrovně.',
      '🗑️ Vymazání postupu má potvrzení a resetuje odemykání hrdinů, krajin a zbraní i rozvoj vesnice, pokladnu, dušičky a bestiář.',
    ],}
  ,
  {
    date: '5. října 2026',
    title: 'Bossové, minibossové a dropy',
    summary: 'Rozšíření výrazných nepřátel a fyzikálnějšího systému kořisti.',
    items: [
      '👹 Pekelný čert dostal výrazný charge s windupem, telegrafem, nárazem a brake fází.',
      '☃️ Prokletý sněhulák byl přejmenován na Zlomyslného sněhuláka a dostal vlastní renderer.',
      '🎨 Bossové a minibossové dostali vlastní ladovské rendery.',
      '🐉 Tříhlavý drak dostal samostatné animace a útoky jednotlivých hlav.',
      '🎁 Dropy získaly tematické afinity, přímé náhodné dropy, bonusy za usmíření jídlem a bossí fontány kořisti.',
      '🪙 Mince mají více nominálních hodnot a dropy používají fyzikální rozptyl.',
    ],}
  ,
  {
    date: '4. října 2026',
    title: 'Samostatná offline hra',
    summary: 'Hra byla připravena jako soběstačný offline export.',
    items: [
      '📄 Samostatný export obsahuje kompletní hru a zdrojové soubory v jednom souboru.',
      '🤖 Zdrojový strom lze z exportu znovu získat pro další úpravy a práci s AI nástroji.',
    ],}
  ,
  {
    date: '4. října 2026',
    title: 'Vizuál, obsah a testovací režim',
    summary: 'Velká sada vizuálních úprav a změn pro testování hry.',
    items: [
      '🥧 Kynutý koláč dostal nový renderer a SVG grafiku.',
      '🍐 Léčivá buchta byla nahrazena hruškou a Svatovítský balzám jitrnicí.',
      '🎨 HUD, karty a modály dostaly ladovské dekorace.',
      '😈 Čert dostal nový sprite, animace, rohy, oči, jazyk, ocas a jiskry.',
      '📱 Čert byl na titulní obrazovce přesunut na pravou stranu nápisu Bubákov.',
      '🧪 Zbraně lze v sandboxu nastavit až na úroveň 0; úroveň 0 není aktivní a sandbox vyžaduje alespoň jednu aktivní zbraň.',
    ],}
  ,
  {
    date: '3. října 2026',
    title: 'Postupný průzkum a Bestiář',
    summary: 'Objevování krajin a bestiáře dostalo vícefázový systém odhalování.',
    items: [
      '🔎 Krajiny se postupně odhalují v pěti stavech od neznámé mapy až po úplný přehled.',
      '📖 Bestiář odhaluje původ, slabiny, odměny, přednosti a nakonec kompletní folklorní zápis.',
    ],}
  ,
  {
    date: '3. října 2026',
    title: 'HUD a mobilní ovládání',
    summary: 'Úpravy čitelnosti a ovládání na mobilních zařízeních.',
    items: [
      '💪 Přidán horní ukazatel Kuráže a XP.',
      '📱 HUD byl přizpůsoben mobilnímu viewportu.',
      '🎮 Touch controls respektují 100dvh, visualViewport a safe-area insety.',
      '📐 Přidána podpora landscape režimu a velmi úzkých displejů.',
      '⏸️ Duplicitní lišta speciální schopnosti byla na dotykových zařízeních odstraněna.',
    ],}
  ,
  {
    date: '2. října 2026',
    title: 'Výkon a stabilita enginu',
    summary: 'Optimalizace herního loopu pro plynulejší simulaci většího počtu entit.',
    items: [
      '⚡ Přidán prostorový hash pro broad-phase collision queries.',
      '🧟 Přidán living-enemy snapshot a squared-distance testy.',
      '👁️ Přidán viewport culling.',
      '🧹 Přidán in-place cleanup entit.',
      '🗂️ SpatialHash byl přepracován na znovupoužitelný numerický index s retenčními buffery.',
      '⏱️ Přidán frame-time clamp proti simulačním burstům.',
    ],
  },
];

export function KronikaChanges() {
  return (
    <div
      className="changelog-list"
      style={{
        maxHeight: '450px',
        overflowY: 'auto',
        color: '#000000',
        padding: '12px',
      }}
    >
      <div
        style={{
          background: '#FFF8E7',
          border: '3px solid var(--ink)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '14px',
          boxShadow: '3px 3px 0 var(--ink)',
        }}
      >
        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#C53026' }}>
          📜 Kronika změn Bubákova
        </div>
        <div style={{ marginTop: '4px', fontWeight: 700, lineHeight: 1.4 }}>
          Zápisky o tom, co se v Bubákově skutečně změnilo. Nejnovější zápis je vždy nahoře.
        </div>
      </div>

      {KRONIKA.map((entry) => (
        <article
          key={entry.date + entry.title}
          className="plan-card"
          style={{
            background: '#FAF6ED',
            border: '3px solid var(--ink)',
            color: '#000000',
          }}
        >
          <div className="plan-header">
            <div>
              <div
                style={{
                  color: '#8A4B08',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                {entry.date}
              </div>
              <h3 style={{ color: '#000000', marginTop: '2px' }}>{entry.title}</h3>
            </div>
            <span
              className="plan-badge-done"
              style={{ background: '#3D7843', color: '#FFFFFF' }}
            >
              Zapsáno
            </span>
          </div>

          <p
            style={{
              margin: '4px 0 10px',
              fontWeight: 800,
              color: '#3D2210',
              lineHeight: 1.35,
            }}
          >
            {entry.summary}
          </p>

          <ul className="plan-items" style={{ color: '#000000' }}>
            {entry.items.map((item) => (
              <li key={item} style={{ color: '#000000' }}>
                {item}
              </li>
            ))}
          </ul>
        </article>
      ))}

      <div
        style={{
          textAlign: 'center',
          fontSize: '0.82rem',
          fontWeight: 800,
          opacity: 0.75,
          padding: '8px 4px 2px',
        }}
      >
        Historie je vedena podle aktuálního vývojářského changelogu.
      </div>
    </div>
  );
}
