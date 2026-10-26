import React, { useState, useRef } from 'react';
import { SmartBabickaBarunkaSvg } from './SmartBabickaBarunkaSvg';
import { SmartBezhlavyRytirSvg } from './SmartBezhlavyRytirSvg';
import { SmartSnehulakSvg } from './SmartSnehulakSvg';
import { SmartTulakSvg } from './SmartTulakSvg';
import { SmartKrajanekSvg } from './SmartKrajanekSvg';
import { SmartKostelnikSvg } from './SmartKostelnikSvg';
import { SmartPasacekSvg } from './SmartPasacekSvg';
import { SmartDedecekNuseSvg } from './SmartDedecekNuseSvg';
import { SmartDedecekArenaSvg } from './SmartDedecekArenaSvg';
import type { SmartCharacterId, SmartCharacterState } from './types';
import { sound } from '../../audio';

export const SmartSvgViewer: React.FC = () => {
  const [selectedChar, setSelectedChar] = useState<SmartCharacterId>('krajanek');
  const [state, setState] = useState<SmartCharacterState>('walk');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [bgType, setBgType] = useState<'parchment' | 'night' | 'snow' | 'grid'>('parchment');
  const [zoom, setZoom] = useState<number>(380);
  const [showCompanion, setShowCompanion] = useState<boolean>(true);
  const [showHeadGlow, setShowHeadGlow] = useState<boolean>(true);
  const [showBossAura, setShowBossAura] = useState<boolean>(true);
  const [showMillstone, setShowMillstone] = useState<boolean>(true);
  const [showSmoke, setShowSmoke] = useState<boolean>(true);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Play corresponding sound effect when triggering actions or switching characters
  const handleStateChange = (newState: SmartCharacterState) => {
    setState(newState);
    if (newState === 'action') {
      if (selectedChar === 'krajanek') {
        sound.zernovHammer();
        setTimeout(() => sound.zernovSlam(), 140);
      } else if (selectedChar === 'babicka_barunka') {
        sound.kindChime();
        setTimeout(() => sound.timeStop(), 150);
      } else if (selectedChar === 'bezhlavy_rytir') {
        sound.boss();
        setTimeout(() => sound.roar(), 120);
        setTimeout(() => sound.slash(), 240);
      } else if (selectedChar === 'snehulak') {
        sound.freeze();
        setTimeout(() => sound.bootSnowCrunch(), 120);
      } else if (selectedChar === 'tulak') {
        sound.cheer();
        setTimeout(() => sound.sukoviceWhirl(), 150);
      } else if (selectedChar === 'kostelnik') {
        sound.churchBell();
        setTimeout(() => sound.slivoviceSplash(), 160);
      } else if (selectedChar === 'pasacek') {
        sound.kominikButton();
        setTimeout(() => sound.cheer(), 180);
      } else if (selectedChar === 'dedecek_nuse' || selectedChar === 'dedecek_arena') {
        sound.grandfatherOpen();
        setTimeout(() => sound.mouseSqueak(), 160);
      }
    } else if (newState === 'react') {
      sound.hit();
      if (selectedChar === 'babicka_barunka') {
        sound.grandmothersApron();
      } else if (selectedChar === 'bezhlavy_rytir') {
        sound.heavyHit();
      } else if (selectedChar === 'snehulak') {
        sound.caneWhip();
      } else if (selectedChar === 'tulak') {
        sound.rooster();
      } else if (selectedChar === 'krajanek') {
        sound.hit();
      } else if (selectedChar === 'kostelnik') {
        sound.candlePulse();
      } else if (selectedChar === 'pasacek') {
        sound.kominikButton();
      } else if (selectedChar === 'dedecek_nuse' || selectedChar === 'dedecek_arena') {
        sound.hit();
        sound.mouseSqueak();
      }
    } else if (newState === 'flee') {
      sound.hit();
      setTimeout(() => sound.bootSnowCrunch(), 120);
    } else if (newState === 'sprint') {
      sound.bootSnowCrunch();
    } else if (newState === 'walk') {
      if (selectedChar === 'snehulak') sound.bootSnowCrunch();
    }
  };

  const handleCharacterSelect = (id: SmartCharacterId) => {
    setSelectedChar(id);
    if (id === 'krajanek') sound.zernovHammer();
    else if (id === 'babicka_barunka') sound.kindChime();
    else if (id === 'bezhlavy_rytir') sound.boss();
    else if (id === 'snehulak') sound.freeze();
    else if (id === 'tulak') sound.sukoviceWhirl();
    else if (id === 'kostelnik') sound.churchBell();
    else if (id === 'pasacek') sound.kominikButton();
    else if (id === 'dedecek_nuse' || id === 'dedecek_arena') sound.grandfatherCall();
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
      id: 'krajanek' as SmartCharacterId,
      name: 'Krajánek',
      sub: 'Hrusický mlýn & Jízda na žernovu',
      icon: '🌾🪨',
      desc: 'Veselý mlynářský tovaryš a pocestný v pomoučeném šatě, klobouku s obilným klasem, červenou puntíkovanou mošnou na holi a kamenickým kladívkem. Při akci "Jízda na žernovu" naskočí na rotující žulový mlýnský kámen s jiskrami a mračny mouky.',
    },
    {
      id: 'tulak' as SmartCharacterId,
      name: 'Tulák',
      sub: 'Hrusické cesty & Pověstná sukovice',
      icon: '🎒🦯',
      desc: 'Rozesmátý tulák v záplatovaném zeleném kabátě s ranečkem na zádech, bylinkovou fajfkou s bafajícím vonným dýmem a mohutnou sukovitou dubovou holí. Bělovousý veselý poutník s červeným nosem a čutorou u pasu, který při akci roztočí ničivou větrnou vichřici s podzimním listím.',
    },
    {
      id: 'bezhlavy_rytir' as SmartCharacterId,
      name: 'Bezhlavý rytíř (BOSS)',
      sub: 'Hrad Zlenice & Královský dvouocasý lev',
      icon: '⚔️👑',
      desc: 'Strašlivý velký BOSS v černěné gotické plátové zbroji s erbem českého dvouocasého lva, vlajícím krvavě rudým pláštěm a obouručním runovým popravčím mečem. V náručí svírá svou vlastní useknutou přilbici s planoucíma očima a při půlnočním seku rozpoutá děsivý válečný řev a rudé blesky.',
    },
    {
      id: 'babicka_barunka' as SmartCharacterId,
      name: 'Babička a Barunka',
      sub: 'Ratibořické údolí & Božena Němcová',
      icon: '👵👧',
      desc: 'Laskavá stařenka v bílém vyšívaném šátku, vlněném plédu a modré pruhované zástěře s velikou kapsou plnou čerstvého chleba, kostkovaného ubrousku a bylinek. Doprovází ji Barunka se zapleteným copem, červenou mašlí a pestrou kyticí lučního kvítí.',
    },
    {
      id: 'snehulak' as SmartCharacterId,
      name: 'Sněhulák s koštětem',
      sub: 'Zimní Hrusice & Josef Lada',
      icon: '⛄🧹',
      desc: 'Mračící se sněhulák kráčející na dvou nohách s březovým koštětem pevně v dlaních. Na hlavě má otlučený hrnec s čepicí čerstvého sněhu a jehličím, kolem krku pruhovanou vlněnou šálu s třásněmi, ostrý mrkvový nos a uhlíky plné zášti.',
    },
    {
      id: 'kostelnik' as SmartCharacterId,
      name: 'Kostelník',
      sub: 'Hrusický kostelík & Svěcená voda',
      icon: '🔔✝️',
      desc: 'Přísný a důstojný kostelník v tmavozeleném církevním svrchníku, hnědé plstěné kloboukové fedoře a vestě se zlatým křížem na prsou. V jedné ruce nese těžký mosazný kotlík se svěcenou vodou a v druhé mocně máchá kropáčem zahánějícím nečisté síly.',
    },
    {
      id: 'pasacek' as SmartCharacterId,
      name: 'Pasáček',
      sub: 'Hrusické pastviny & Dřevěná píšťalka',
      icon: '🪈👦',
      desc: 'Hbitý bosonohý chlapec z ladovských pastvin s rozcuchanými kaštanovými vlasy, orlím pírkem za uchem a pastýřskou píšťalkou. V modré vyšívané vestičce, červeném šátku a záplatovaných kalhotách radostně uhání loukou a vyhrává líbezné melodie.',
    },
    {
      id: 'dedecek_nuse' as SmartCharacterId,
      name: 'Čertův dědeček s nůší',
      sub: 'Dědečkův krámek & Otevřená nůše',
      icon: '👹🧺',
      desc: 'Rozverný čertovský kramář s mohutnými vroubkovanými rohy, záplatovaným kabátcem, bafající fajfkou a kopyty. V obrovské otevřené pletené nůši s koženými řemeny nabízí vzácné lektvary, sušené bylinky, vyřezávanou truhličku, zlatý ananas i pohybující se myšičku Rézinku.',
    },
    {
      id: 'dedecek_arena' as SmartCharacterId,
      name: 'Dědeček v aréně',
      sub: 'Polní pochod & Nůše na zádech',
      icon: '👹🎒',
      desc: 'Kráčející čertovský handlíř s nůší na zádech, kulatými drátěnými brýlemi, vyceněnými křivými zuby, bafající fajfkou a plynulým čertovským ocasem. Jednou nohou dupe rozeklaným kopytem s ovinkami, druhou našlapuje ve šněrovací škorni a z nůše mu vykukuje myška Rézinka, měděná lucerna a plechová bandaska.',
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
          {selectedChar === 'krajanek' && (
            <SmartKrajanekSvg
              state={state}
              speed={speed}
              isPlaying={isPlaying}
              direction={direction}
              size={zoom}
              interactive={true}
              onClick={() => handleStateChange(state === 'action' ? 'walk' : 'action')}
              features={{
                showMillstone,
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
                showSmoke,
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
                showBossAura,
                showParticles,
                showShadow: true,
                showOutline: true,
              }}
            />
          )}

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

          {selectedChar === 'pasacek' && (
            <SmartPasacekSvg
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

          {selectedChar === 'dedecek_nuse' && (
            <SmartDedecekNuseSvg
              state={state}
              speed={speed}
              isPlaying={isPlaying}
              direction={direction}
              size={zoom + 40}
              interactive={true}
              onClick={() => handleStateChange(state === 'action' ? 'idle' : 'action')}
              features={{
                showCompanion,
                showParticles,
                showShadow: true,
                showOutline: true,
              }}
            />
          )}

          {selectedChar === 'dedecek_arena' && (
            <SmartDedecekArenaSvg
              state={state}
              speed={speed}
              isPlaying={isPlaying}
              direction={direction}
              size={zoom + 40}
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

          {/* FLOATING ACTION PILL ON BOTTOM */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-200/60 shadow-lg text-xs font-medium">
            <span className="text-slate-500">Kliknutím na postavu spustíte:</span>
            <span className="text-amber-700 font-bold uppercase tracking-wider">
              {selectedChar === 'krajanek'
                ? 'Jízda na žernovu & jiskry'
                : selectedChar === 'tulak'
                ? 'Pověstná sukovice & vichřice'
                : selectedChar === 'bezhlavy_rytir'
                ? 'Půlnoční stětí & řev (BOSS)'
                : selectedChar === 'babicka_barunka'
                ? 'Laskavý zázrak'
                : selectedChar === 'snehulak'
                ? 'Vánici s koštětem'
                : selectedChar === 'kostelnik'
                ? 'Kropení svěcenou vodou'
                : selectedChar === 'pasacek'
                ? 'Hra na pastýřskou píšťalku'
                : 'Otevření nůše & Kramářský zázrak'}
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
              { id: 'sprint' as SmartCharacterState, label: 'Rychlý sprint / náběh', icon: '🏃' },
              { id: 'action' as SmartCharacterState, label: 'Bojová akce / úder', icon: '⚡' },
              { id: 'react' as SmartCharacterState, label: 'Zásah / Vyděšení', icon: '💥' },
              { id: 'flee' as SmartCharacterState, label: 'Útěk / Úhyb', icon: '💨' },
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

          {selectedChar === 'krajanek' && (
            <label className="flex items-center gap-2.5 text-xs font-semibold text-amber-950 cursor-pointer">
              <input
                type="checkbox"
                checked={showMillstone}
                onChange={(e) => setShowMillstone(e.target.checked)}
                className="rounded accent-amber-600 w-4 h-4 cursor-pointer"
              />
              <span>Zobrazit obří žulový žernov (mlýnský kámen)</span>
            </label>
          )}

          {selectedChar === 'tulak' && (
            <label className="flex items-center gap-2.5 text-xs font-semibold text-amber-950 cursor-pointer">
              <input
                type="checkbox"
                checked={showSmoke}
                onChange={(e) => setShowSmoke(e.target.checked)}
                className="rounded accent-amber-600 w-4 h-4 cursor-pointer"
              />
              <span>Bafající vonný kouř z bylinkové fajfky</span>
            </label>
          )}

          {selectedChar === 'bezhlavy_rytir' && (
            <>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-amber-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHeadGlow}
                  onChange={(e) => setShowHeadGlow(e.target.checked)}
                  className="rounded accent-amber-600 w-4 h-4 cursor-pointer"
                />
                <span>Planoucí zrak v očích useknuté hlavy</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-amber-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBossAura}
                  onChange={(e) => setShowBossAura(e.target.checked)}
                  className="rounded accent-amber-600 w-4 h-4 cursor-pointer"
                />
                <span>Prokletá pekelná aura a runy na zemi</span>
              </label>
            </>
          )}

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

          {(selectedChar === 'dedecek_nuse' || selectedChar === 'dedecek_arena') && (
            <label className="flex items-center gap-2.5 text-xs font-semibold text-amber-950 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompanion}
                onChange={(e) => setShowCompanion(e.target.checked)}
                className="rounded accent-amber-600 w-4 h-4 cursor-pointer"
              />
              <span>Zobrazit pohybující se myšku Rézinku v nůši</span>
            </label>
          )}

          <label className="flex items-center gap-2.5 text-xs font-semibold text-amber-950 cursor-pointer">
            <input
              type="checkbox"
              checked={showParticles}
              onChange={(e) => setShowParticles(e.target.checked)}
              className="rounded accent-amber-600 w-4 h-4 cursor-pointer"
            />
            <span>Dynamické částice (jiskry / mouka / kouř / sníh)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
