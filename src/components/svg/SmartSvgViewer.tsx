import React, { useState, useRef } from 'react';
import { SmartBabickaBarunkaSvg } from './SmartBabickaBarunkaSvg';
import { SmartBezhlavyRytirSvg } from './SmartBezhlavyRytirSvg';
import { SmartSnehulakSvg } from './SmartSnehulakSvg';
import { SmartTulakSvg } from './SmartTulakSvg';
import { SmartKostelnikSvg } from './SmartKostelnikSvg';
import type { SmartCharacterId, SmartCharacterState } from './types';
import { sound } from '../../audio';

export const SmartSvgViewer: React.FC = () => {
  const [selectedChar, setSelectedChar] = useState<SmartCharacterId>('babicka_barunka');
  const [state, setState] = useState<SmartCharacterState>('walk');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [bgType, setBgType] = useState<'parchment' | 'night' | 'snow' | 'grid'>('parchment');
  const [zoom, setZoom] = useState<number>(380);
  const [showCompanion, setShowCompanion] = useState<boolean>(true);
  const [showHeadGlow, setShowHeadGlow] = useState<boolean>(true);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Play corresponding sound effect when triggering actions or switching characters
  const handleStateChange = (newState: SmartCharacterState) => {
    setState(newState);
    if (newState === 'action') {
      if (selectedChar === 'babicka_barunka') {
        sound.kindChime();
        setTimeout(() => sound.timeStop(), 150);
      } else if (selectedChar === 'bezhlavy_rytir') {
        sound.roar();
        setTimeout(() => sound.slash(), 180);
      } else if (selectedChar === 'snehulak') {
        sound.freeze();
        setTimeout(() => sound.bootSnowCrunch(), 120);
      } else if (selectedChar === 'tulak') {
        sound.cheer();
        setTimeout(() => sound.sukoviceWhirl(), 150);
      } else if (selectedChar === 'kostelnik') {
        sound.churchBell();
        setTimeout(() => sound.slivoviceSplash(), 160);
      }
    } else if (newState === 'react') {
      if (selectedChar === 'babicka_barunka') {
        sound.grandmothersApron();
      } else if (selectedChar === 'bezhlavy_rytir') {
        sound.heavyHit();
      } else if (selectedChar === 'snehulak') {
        sound.caneWhip();
      } else if (selectedChar === 'tulak') {
        sound.rooster();
      } else if (selectedChar === 'kostelnik') {
        sound.candlePulse();
      }
    } else if (newState === 'walk') {
      if (selectedChar === 'snehulak') sound.bootSnowCrunch();
    }
  };

  const handleCharacterSelect = (id: SmartCharacterId) => {
    setSelectedChar(id);
    if (id === 'babicka_barunka') sound.kindChime();
    else if (id === 'bezhlavy_rytir') sound.boss();
    else if (id === 'snehulak') sound.freeze();
    else if (id === 'tulak') sound.sukoviceWhirl();
    else if (id === 'kostelnik') sound.churchBell();
  };

  // Export current SVG as clean string
  const handleCopySvg = () => {
    if (!containerRef.current) return;
    const svgElem = containerRef.current.querySelector('svg');
    if (!svgElem) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElem);
    navigator.clipboard.writeText(source).then(() => {
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2200);
    });
  };

  const handleDownloadSvg = () => {
    if (!containerRef.current) return;
    const svgElem = containerRef.current.querySelector('svg');
    if (!svgElem) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElem);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedChar}_smart_animation.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const characters = [
    {
      id: 'babicka_barunka' as SmartCharacterId,
      name: 'Babička a Barunka',
      sub: 'Ratibořické údolí & Božena Němcová',
      icon: '👵👧',
      desc: 'Laskavá stařenka v bílém vyšívaném šátku, vlněném plédu a modré pruhované zástěře s velikou kapsou plnou čerstvého chleba, kostkovaného ubrousku a bylinek. Doprovází ji Barunka se zapleteným copem, červenou mašlí a pestrou kyticí lučního kvítí.',
    },
    {
      id: 'bezhlavy_rytir' as SmartCharacterId,
      name: 'Bezhlavý rytíř',
      sub: 'Zámecká zřícenina & Český heraldický lev',
      icon: '⚔️🛡️',
      desc: 'Strašlivý středověký rek v plátové zbroji s drátěnou košilí, roztrhaným rudým pláštěm a bílou varkočkou se slavným českým dvouocasým lvem. Pod paží třímá svou vlastní uťatou hlavu s přilbicí, rudým chocholem a planoucím hněvem v očích.',
    },
    {
      id: 'snehulak' as SmartCharacterId,
      name: 'Sněhulák s koštětem',
      sub: 'Zimní Hrusice & Josef Lada',
      icon: '⛄🧹',
      desc: 'Mračící se sněhulák kráčející na dvou nohách s březovým koštětem pevně v dlaních. Na hlavě má otlučený hrnec s čepicí čerstvého sněhu a jehličím, kolem krku pruhovanou vlněnou šálu s třásněmi, ostrý mrkvový nos a uhlíky plné zášti.',
    },
    {
      id: 'tulak' as SmartCharacterId,
      name: 'Tulák',
      sub: 'Hrusické cesty & Veselá mysl',
      icon: '🎒🦯',
      desc: 'Rozesmátý tulák v záplatovaném zeleném kabátě s ranečkem na zádech a mohutnou sukovitou holí. Bělovousý veselý poutník s červeným nosem, rozepnutou košilí, ovázanými lýtky a čutorou u pasu, který radostně vykračuje světem.',
    },
    {
      id: 'kostelnik' as SmartCharacterId,
      name: 'Kostelník',
      sub: 'Hrusický kostelík & Svěcená voda',
      icon: '🔔✝️',
      desc: 'Přísný a důstojný kostelník v tmavozeleném církevním svrchníku, hnědé plstěné kloboukové fedoře a vestě se zlatým křížem na prsou. V jedné ruce nese těžký mosazný kotlík se svěcenou vodou a v druhé mocně máchá kropáčem zahánějícím nečisté síly.',
    },
  ];

  const currentChar = characters.find((c) => c.id === selectedChar) || characters[0];

  // Background style
  const bgStyles = {
    parchment: 'bg-[#FAF4E4] border-[#D9CAA5]',
    night: 'bg-[#0F172A] border-[#334155]',
    snow: 'bg-[#F0F9FF] border-[#BAE6FD]',
    grid: 'bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px] bg-[#FFFFFF] border-slate-300',
  }[bgType];

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-2 sm:p-4">
      {/* LEFT COLUMN: INTERACTIVE STAGE & CANVAS */}
      <div className="flex-1 flex flex-col items-center">
        {/* CHARACTER SELECTION TABS */}
        <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
          {characters.map((c) => {
            const active = selectedChar === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleCharacterSelect(c.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                  active
                    ? 'bg-amber-600 text-white ring-4 ring-amber-300 shadow-md scale-102'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200'
                }`}
              >
                <span className="text-xl">{c.icon}</span>
                <div className="text-left">
                  <div className="text-sm leading-tight">{c.name}</div>
                  <div className={`text-[10px] ${active ? 'text-amber-100' : 'text-amber-700/80'}`}>{c.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* INTERACTIVE STAGE */}
        <div
          ref={containerRef}
          className={`relative w-full rounded-2xl border-2 flex items-center justify-center min-h-[460px] sm:min-h-[520px] transition-colors shadow-inner overflow-hidden ${bgStyles}`}
        >
          {/* Subtle Stage Lighting & Overlay */}
          <div className="absolute top-3 left-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/10 text-slate-700 backdrop-blur-sm pointer-events-none flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Smart SVG • Interaktivní kurzor
          </div>

          {/* ACTIVE CHARACTER SVG */}
          {selectedChar === 'babicka_barunka' && (
            <SmartBabickaBarunkaSvg
              state={state}
              speed={speed}
              isPlaying={isPlaying}
              direction={direction}
              size={zoom}
              interactive={true}
              onClick={() => handleStateChange(state === 'action' ? 'walk' : 'action')}
              features={{
                showCompanion,
                showParticles,
                showShadow: true,
                showOutline: true,
              }}
            />
          )}

          {selectedChar === 'bezhlavy_rytir' && (
            <SmartBezhlavyRytirSvg
              state={state}
              speed={speed}
              isPlaying={isPlaying}
              direction={direction}
              size={zoom}
              interactive={true}
              onClick={() => handleStateChange(state === 'action' ? 'walk' : 'action')}
              features={{
                showHeadGlow,
                showParticles,
                showShadow: true,
                showOutline: true,
              }}
            />
          )}

          {selectedChar === 'snehulak' && (
            <SmartSnehulakSvg
              state={state}
              speed={speed}
              isPlaying={isPlaying}
              direction={direction}
              size={zoom}
              interactive={true}
              onClick={() => handleStateChange(state === 'action' ? 'walk' : 'action')}
              features={{
                showParticles,
                showShadow: true,
                showOutline: true,
              }}
            />
          )}

          {selectedChar === 'tulak' && (
            <SmartTulakSvg
              state={state}
              speed={speed}
              isPlaying={isPlaying}
              direction={direction}
              size={zoom}
              interactive={true}
              onClick={() => handleStateChange(state === 'action' ? 'walk' : 'action')}
              features={{
                showParticles,
                showShadow: true,
                showOutline: true,
              }}
            />
          )}

          {selectedChar === 'kostelnik' && (
            <SmartKostelnikSvg
              state={state}
              speed={speed}
              isPlaying={isPlaying}
              direction={direction}
              size={zoom}
              interactive={true}
              onClick={() => handleStateChange(state === 'action' ? 'walk' : 'action')}
              features={{
                showParticles,
                showShadow: true,
                showOutline: true,
              }}
            />
          )}

          {/* FLOATING ACTION PILL ON BOTTOM */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-200/60 shadow-lg text-xs font-medium">
            <span className="text-slate-500">Kliknutím na postavu spustíte:</span>
            <span className="text-amber-700 font-bold uppercase tracking-wider">
              {selectedChar === 'babicka_barunka'
                ? 'Laskavý zázrak'
                : selectedChar === 'bezhlavy_rytir'
                ? 'Válečný řev & sek'
                : selectedChar === 'snehulak'
                ? 'Vánici s koštětem'
                : selectedChar === 'tulak'
                ? 'Radostný poskok & sukovice'
                : 'Kropení svěcenou vodou'}
            </span>
          </div>
        </div>

        {/* BOTTOM QUICK TIMELINE BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full mt-4 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80">
          {/* Play/Pause & Direction */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              {isPlaying ? '⏸ Pozastavit' : '▶ Spustit'}
            </button>
            <button
              onClick={() => setDirection((prev) => (prev === 1 ? -1 : 1))}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-semibold transition-all"
              title="Otočit směr chůze"
            >
              ⇄ Otočit ({direction === 1 ? 'Vpravo' : 'Vlevo'})
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900">Rychlost:</span>
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  speed === s
                    ? 'bg-amber-700 text-white'
                    : 'bg-white hover:bg-amber-200 text-amber-950 border border-amber-300'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySvg}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              {copiedNotice ? '✓ Zkopírováno!' : '📋 Zkopírovat SVG'}
            </button>
            <button
              onClick={handleDownloadSvg}
              className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              💾 Stáhnout SVG
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: CONTROLS, ACTIONS & FOLKLORE DETAILS */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        {/* CHARACTER CARD INFO */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-3xl p-2 bg-amber-100 rounded-xl">{currentChar.icon}</span>
            <div>
              <h3 className="font-extrabold text-amber-950 text-lg leading-tight">{currentChar.name}</h3>
              <p className="text-xs font-semibold text-amber-700">{currentChar.sub}</p>
            </div>
          </div>
          <p className="text-xs text-amber-900/90 mt-3 leading-relaxed border-t border-amber-200/60 pt-2.5">
            {currentChar.desc}
          </p>
        </div>

        {/* STATE / ACTION SELECTOR */}
        <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm">
          <h4 className="font-bold text-amber-950 text-sm mb-3 flex items-center gap-2">
            <span>🎭</span> Stav a akce animace
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'idle' as SmartCharacterState, label: 'Klid (Idle)', icon: '🌿' },
              { id: 'walk' as SmartCharacterState, label: 'Krok & Chůze', icon: '🚶' },
              { id: 'action' as SmartCharacterState, label: 'Zvláštní akce', icon: '⚡' },
              { id: 'react' as SmartCharacterState, label: 'Reakce & Pozor', icon: '😲' },
            ].map((st) => {
              const active = state === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => handleStateChange(st.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    active
                      ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200'
                  }`}
                >
                  <span className="text-base">{st.icon}</span>
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STAGE SETTINGS (BACKGROUND & ZOOM) */}
        <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
            <span>🎨</span> Pozadí a měřítko
          </h4>

          {/* Background pills */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'parchment' as const, label: '📜 Papír' },
              { id: 'night' as const, label: '🌌 Noc' },
              { id: 'snow' as const, label: '❄️ Sníh' },
              { id: 'grid' as const, label: '🏁 Mřížka' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBgType(b.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                  bgType === b.id
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Zoom Slider */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between text-xs font-bold text-amber-900">
              <span>Velikost SVG</span>
              <span>{zoom}px</span>
            </div>
            <input
              type="range"
              min="280"
              max="520"
              step="10"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="accent-amber-600 cursor-pointer w-full"
            />
          </div>
        </div>

        {/* CHARACTER SPECIFIC FEATURE TOGGLES */}
        <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
          <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
            <span>⚙️</span> Speciální vrstvy a detaily
          </h4>

          {selectedChar === 'babicka_barunka' && (
            <label className="flex items-center gap-2.5 text-xs font-semibold text-amber-950 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompanion}
                onChange={(e) => setShowCompanion(e.target.checked)}
                className="rounded accent-amber-600 w-4 h-4 cursor-pointer"
              />
              <span>Zobrazit vnučku Barunku s kytičkou</span>
            </label>
          )}

          {selectedChar === 'bezhlavy_rytir' && (
            <label className="flex items-center gap-2.5 text-xs font-semibold text-amber-950 cursor-pointer">
              <input
                type="checkbox"
                checked={showHeadGlow}
                onChange={(e) => setShowHeadGlow(e.target.checked)}
                className="rounded accent-amber-600 w-4 h-4 cursor-pointer"
              />
              <span>Planoucí hněv v očích useknuté hlavy</span>
            </label>
          )}

          <label className="flex items-center gap-2.5 text-xs font-semibold text-amber-950 cursor-pointer">
            <input
              type="checkbox"
              checked={showParticles}
              onChange={(e) => setShowParticles(e.target.checked)}
              className="rounded accent-amber-600 w-4 h-4 cursor-pointer"
            />
            <span>Dynamické částice (okvětní lístky / sníh / zásek)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
