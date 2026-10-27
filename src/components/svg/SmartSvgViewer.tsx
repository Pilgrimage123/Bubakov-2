import React, { useState, useRef } from 'react';
import { SmartDedecekNuseSvg } from './SmartDedecekNuseSvg';
import { SmartDedecekArenaSvg } from './SmartDedecekArenaSvg';
import type { SmartCharacterId, SmartCharacterState } from './types';
import { sound } from '../../audio';

export const SmartSvgViewer: React.FC = () => {
  const [selectedChar, setSelectedChar] = useState<SmartCharacterId>('dedecek_nuse');
  const [state, setState] = useState<SmartCharacterState>('walk');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [bgType, setBgType] = useState<'parchment' | 'night' | 'snow' | 'grid'>('parchment');
  const [zoom, setZoom] = useState<number>(380);

  // Dědeček unique feature toggles
  const [showHeadGlow, setShowHeadGlow] = useState<boolean>(true);
  const [showCompanion, setShowCompanion] = useState<boolean>(true);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [showSmoke, setShowSmoke] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleCharSelect = (id: SmartCharacterId) => {
    setSelectedChar(id);
    sound.playTone(660, 'sine', 0.05, 0.08);
  };

  const handleStateSelect = (s: SmartCharacterState) => {
    setState(s);
    sound.playTone(660, 'sine', 0.05, 0.08);
  };

  const handleExportSvg = () => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedChar}_${state}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sound.coin();
  };

  const bgStyles = {
    parchment: { background: '#F4E8D1', border: '3px solid #8B4513' },
    night: { background: '#0F172A', border: '3px solid #334155' },
    snow: { background: '#E2E8F0', border: '3px solid #94A3B8' },
    grid: {
      backgroundColor: '#FAFAF9',
      backgroundImage: 'linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      border: '3px solid #CBD5E1',
    },
  };

  const CHAR_DEFS = [
    {
      id: 'dedecek_nuse' as SmartCharacterId,
      name: 'Čertův dědeček (Nůše & Obchod)',
      role: 'Obchodník / Legenda',
      color: '#C53026',
      desc: 'Autentický Josef Lada styl — nůše plná dukátů a pekelných artefaktů, fajfka, beraní rohy a huňatý kožich.',
    },
    {
      id: 'dedecek_arena' as SmartCharacterId,
      name: 'Čertův dědeček (Aréna)',
      role: 'Pekelný spojenec',
      color: '#DC2626',
      desc: 'Bojová varianta v aréně — plamenná hůl, pekelný plášť, ohnivé stopy a podpora lovců.',
    },
  ];

  const features = {
    showHeadGlow,
    showCompanion,
    showParticles,
    showSmoke,
    showShadow: true,
    showOutline: true,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header with info */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FAF5E8 0%, #F5E8D0 100%)',
          border: '2px solid #8B4513',
          borderRadius: 8,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontFamily: "'Crimson Pro', serif",
              fontSize: 20,
              color: '#451A03',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🔥 Smart SVG Studio: Čertův dědeček
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                background: '#C53026',
                color: '#FAF5E8',
                padding: '2px 8px',
                borderRadius: 12,
              }}
            >
              Jediná vektorová Smart SVG postava
            </span>
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#78350F' }}>
            Všichni ostatní lovci a nepřátelé jsou vykreslováni procedurálním 2D Canvasem. Zde je interaktivní vektorové studio pro Čertova dědečka.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleExportSvg}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '2px solid #8B4513',
              background: '#C53026',
              color: '#FAF5E8',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            💾 Exportovat čisté SVG
          </button>
        </div>
      </div>

      {/* Main Area: Character Picker + Stage + Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: 16 }}>
        {/* Left Column: Character Selection */}
        <div
          style={{
            background: '#FAF5E8',
            border: '2px solid #8B4513',
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#451A03', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Varianty postavy
          </div>
          {CHAR_DEFS.map((char) => {
            const isSel = selectedChar === char.id;
            return (
              <button
                key={char.id}
                onClick={() => handleCharSelect(char.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: isSel ? '2px solid #C53026' : '1px solid #D6C7B2',
                  background: isSel ? '#F5E8D0' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: isSel ? '0 2px 6px rgba(197, 48, 38, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: isSel ? '#991B1B' : '#1C1917' }}>
                    {char.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: char.color,
                      border: `1px solid ${char.color}`,
                      borderRadius: 4,
                      padding: '1px 5px',
                    }}
                  >
                    {char.role}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#78350F', marginTop: 4, lineHeight: 1.3 }}>
                  {char.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Center Column: SVG Stage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            ref={containerRef}
            style={{
              ...bgStyles[bgType],
              borderRadius: 8,
              minHeight: 440,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {selectedChar === 'dedecek_nuse' ? (
              <SmartDedecekNuseSvg
                state={state}
                isPlaying={isPlaying}
                speed={speed}
                direction={direction}
                size={zoom}
                features={features}
              />
            ) : (
              <SmartDedecekArenaSvg
                state={state}
                isPlaying={isPlaying}
                speed={speed}
                direction={direction}
                size={zoom}
                features={features}
              />
            )}
          </div>

          {/* Quick Animation State Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              background: '#FAF5E8',
              border: '2px solid #8B4513',
              borderRadius: 8,
              padding: '8px 12px',
            }}
          >
            {(['idle', 'walk', 'sprint', 'action', 'react', 'flee'] as SmartCharacterState[]).map(
              (s) => {
                const active = state === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleStateSelect(s)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      border: active ? '2px solid #C53026' : '1px solid #D6C7B2',
                      background: active ? '#C53026' : '#FFFFFF',
                      color: active ? '#FAF5E8' : '#451A03',
                      fontWeight: active ? 700 : 500,
                      fontSize: 12,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {s}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Right Column: Controls */}
        <div
          style={{
            background: '#FAF5E8',
            border: '2px solid #8B4513',
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#451A03', textTransform: 'uppercase' }}>
            Ovládání přehrávání
          </div>

          {/* Play / Pause / Direction */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 4,
                border: '1px solid #8B4513',
                background: isPlaying ? '#F5E8D0' : '#DC2626',
                color: isPlaying ? '#451A03' : '#FFFFFF',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {isPlaying ? '⏸ Pauza' : '▶ Spustit'}
            </button>
            <button
              onClick={() => setDirection((d) => (d === 1 ? -1 : 1))}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 4,
                border: '1px solid #8B4513',
                background: '#FAF5E8',
                color: '#451A03',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              ↔ Otočit ({direction === 1 ? 'Vpravo' : 'Vlevo'})
            </button>
          </div>

          {/* Speed slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#451A03' }}>
              <span>Rychlost:</span>
              <b>{speed.toFixed(1)}×</b>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#C53026' }}
            />
          </div>

          {/* Zoom slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#451A03' }}>
              <span>Měřítko (px):</span>
              <b>{zoom}px</b>
            </div>
            <input
              type="range"
              min="200"
              max="600"
              step="20"
              value={zoom}
              onChange={(e) => setZoom(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#C53026' }}
            />
          </div>

          {/* Background switcher */}
          <div>
            <div style={{ fontSize: 12, color: '#451A03', marginBottom: 4 }}>Pozadí plátna:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {(['parchment', 'night', 'snow', 'grid'] as const).map((bg) => (
                <button
                  key={bg}
                  onClick={() => setBgType(bg)}
                  style={{
                    padding: '4px 0',
                    fontSize: 11,
                    borderRadius: 4,
                    border: bgType === bg ? '2px solid #C53026' : '1px solid #D6C7B2',
                    background: bgType === bg ? '#F5E8D0' : '#FFFFFF',
                    color: '#451A03',
                    cursor: 'pointer',
                    fontWeight: bgType === bg ? 700 : 500,
                  }}
                >
                  {bg === 'parchment' ? '📜 Pergamen' : bg === 'night' ? '🌙 Noc' : bg === 'snow' ? '❄ Sníh' : '📐 Mřížka'}
                </button>
              ))}
            </div>
          </div>

          {/* Specific toggles for Čertův dědeček */}
          <div style={{ borderTop: '1px solid #D6C7B2', paddingTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#451A03', marginBottom: 6 }}>
              Vizuální vrstvy Dědečka:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#451A03', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showHeadGlow}
                  onChange={(e) => setShowHeadGlow(e.target.checked)}
                />
                Rohy a pekelná aura
              </label>
              <label style={{ fontSize: 11, color: '#451A03', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showCompanion}
                  onChange={(e) => setShowCompanion(e.target.checked)}
                />
                Myška Rézinka v nůši
              </label>
              <label style={{ fontSize: 11, color: '#451A03', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showParticles}
                  onChange={(e) => setShowParticles(e.target.checked)}
                />
                Zlaté dukáty & jiskry
              </label>
              <label style={{ fontSize: 11, color: '#451A03', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showSmoke}
                  onChange={(e) => setShowSmoke(e.target.checked)}
                />
                Kouř z fajfky
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
