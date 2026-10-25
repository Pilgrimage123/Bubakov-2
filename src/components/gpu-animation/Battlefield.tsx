import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Enemy } from './Enemy';
import {
  type EnemyArchetype,
  type EnemyRuntimeData,
  ARCHETYPE_PRESETS,
  computeVolumePreservingStretch,
} from './types';
import { BAKED_SPRITES } from './sprites';
import { ALL_ENEMY_IDS, getEnemyGpuConfig } from './enemyCatalog';
import { ENEMIES } from '../../data/enemies';
import './enemyAnimation.css';

interface BattlefieldProps {
  initialEnemyCount?: number;
  className?: string;
  showInspectorByDefault?: boolean;
}

export const Battlefield: React.FC<BattlefieldProps> = ({
  initialEnemyCount = 120,
  className = '',
  showInspectorByDefault = true,
}) => {
  // Arena viewport bounds
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const [arenaSize, setArenaSize] = useState<{ width: number; height: number }>({
    width: 900,
    height: 580,
  });

  // Track arena dimensions
  useEffect(() => {
    const updateSize = () => {
      if (arenaRef.current) {
        const rect = arenaRef.current.getBoundingClientRect();
        setArenaSize({
          width: Math.max(400, Math.floor(rect.width)),
          height: Math.max(350, Math.floor(rect.height)),
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Player state: (x, y) coordinates
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 450, y: 290 });
  const playerPosRef = useRef<{ x: number; y: number }>({ x: 450, y: 290 });
  playerPosRef.current = playerPos;

  // Selected folklore enemy from dropdown
  const [selectedFolkloreId, setSelectedFolkloreId] = useState<string>('bubak');

  // Simulation controls
  const [targetCount, setTargetCount] = useState<number>(initialEnemyCount);
  const [movementMode, setMovementMode] = useState<'chase' | 'wander' | 'orbit' | 'freeze'>('chase');
  const [autoWanderPlayer, setAutoWanderPlayer] = useState<boolean>(true);
  const [showDeadzoneVisualizer, setShowDeadzoneVisualizer] = useState<boolean>(true);
  const [showDebugBadges, setShowDebugBadges] = useState<boolean>(false);
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);

  // Performance metrics
  const [fps, setFps] = useState<number>(60);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(16.6);

  // Custom archetype parameter overrides for the live tuner
  const [overrideArchetype, setOverrideArchetype] = useState<EnemyArchetype | 'all'>('all');
  const [tunerDuration, setTunerDuration] = useState<number>(0.52);
  const [tunerAngle, setTunerAngle] = useState<number>(11);
  const [tunerSquashX, setTunerSquashX] = useState<number>(1.16);
  const [tunerSquashY, setTunerSquashY] = useState<number>(0.86);

  // Generate initial enemies (supporting all 58 folklore enemies or generic archetypes)
  const createEnemy = useCallback(
    (id: string, fixedArchetype?: EnemyArchetype, enemyKey?: string): EnemyRuntimeData => {
      const w = arenaSize.width || 800;
      const h = arenaSize.height || 500;
      const side = Math.floor(Math.random() * 4);
      let x = Math.random() * w;
      let y = Math.random() * h;

      if (side === 0) y = -30;
      else if (side === 1) x = w + 30;
      else if (side === 2) y = h + 30;
      else x = -30;

      if (enemyKey && ALL_ENEMY_IDS.includes(enemyKey)) {
        const conf = getEnemyGpuConfig(enemyKey);
        return {
          id,
          x,
          y,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          archetype: conf.archetype,
          src: conf.spriteUrl,
          baseScale: conf.params.baseScale,
          width: conf.params.width,
          height: conf.params.height,
        };
      }

      const archetypes: EnemyArchetype[] = ['runner', 'slime', 'bug', 'golem'];
      const arch = fixedArchetype || archetypes[Math.floor(Math.random() * archetypes.length)];
      const preset = ARCHETYPE_PRESETS[arch];

      return {
        id,
        x,
        y,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        archetype: arch,
        src: BAKED_SPRITES[arch],
        baseScale: preset.baseScale,
        width: preset.width,
        height: preset.height,
      };
    },
    [arenaSize]
  );

  const [enemies, setEnemies] = useState<EnemyRuntimeData[]>(() => {
    return Array.from({ length: initialEnemyCount }, (_, i) => {
      const archList: EnemyArchetype[] = ['runner', 'slime', 'bug', 'golem'];
      const arch = archList[i % archList.length];
      const preset = ARCHETYPE_PRESETS[arch];
      return {
        id: `enemy-${i + 1}`,
        x: 60 + Math.random() * 780,
        y: 60 + Math.random() * 460,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30,
        archetype: arch,
        src: BAKED_SPRITES[arch],
        baseScale: preset.baseScale,
        width: preset.width,
        height: preset.height,
      };
    });
  });

  const enemiesRef = useRef<EnemyRuntimeData[]>(enemies);
  enemiesRef.current = enemies;

  // Adjust enemy count dynamically
  useEffect(() => {
    setEnemies((prev) => {
      if (prev.length === targetCount) return prev;
      if (prev.length < targetCount) {
        const added: EnemyRuntimeData[] = [];
        for (let i = prev.length; i < targetCount; i++) {
          added.push(createEnemy(`enemy-${Date.now()}-${i}`));
        }
        return [...prev, ...added];
      }
      return prev.slice(0, targetCount);
    });
  }, [targetCount, createEnemy]);

  // Main simulation tick loop (60 FPS)
  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();
    let frameCounter = 0;
    let fpsAccumulator = 0;
    let simTime = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      const frameDeltaMs = now - lastTime;
      lastTime = now;
      simTime += dt;

      // FPS calculation every 20 frames
      frameCounter++;
      fpsAccumulator += frameDeltaMs;
      if (frameCounter >= 20) {
        const avgFrameMs = fpsAccumulator / frameCounter;
        setFps(Math.round(1000 / avgFrameMs));
        setFrameTimeMs(Number(avgFrameMs.toFixed(1)));
        frameCounter = 0;
        fpsAccumulator = 0;
      }

      // Auto-wander player movement
      if (autoWanderPlayer) {
        const awX =
          arenaSize.width / 2 + Math.cos(simTime * 0.9) * (arenaSize.width * 0.35);
        const awY =
          arenaSize.height / 2 + Math.sin(simTime * 1.4) * (arenaSize.height * 0.28);
        setPlayerPos({ x: awX, y: awY });
      }

      const pX = playerPosRef.current.x;
      const pY = playerPosRef.current.y;

      if (movementMode !== 'freeze') {
        const currentEnemies = enemiesRef.current;
        const nextEnemies = currentEnemies.map((e, idx) => {
          let nextX = e.x;
          let nextY = e.y;
          const preset = ARCHETYPE_PRESETS[e.archetype];
          const speed = preset.speed;

          if (movementMode === 'chase') {
            const dx = pX - e.x;
            const dy = pY - e.y;
            const dist = Math.hypot(dx, dy) || 1;
            // Stop slightly before player to cluster nicely like in Bullet Heaven
            const minStopDist = 30 + (idx % 25);
            if (dist > minStopDist) {
              const dirX = dx / dist;
              const dirY = dy / dist;
              nextX += dirX * speed * dt;
              nextY += dirY * speed * dt;
            } else {
              // Gentle flocking jitter around player
              nextX += Math.sin(simTime * 4 + idx) * 12 * dt;
              nextY += Math.cos(simTime * 4 + idx) * 12 * dt;
            }
          } else if (movementMode === 'wander') {
            const angle = Math.sin(simTime * 0.8 + idx * 0.4) * Math.PI * 2;
            nextX += Math.cos(angle) * (speed * 0.6) * dt;
            nextY += Math.sin(angle) * (speed * 0.6) * dt;
          } else if (movementMode === 'orbit') {
            const currentAngle = Math.atan2(e.y - pY, e.x - pX);
            const orbitRadius = 140 + (idx % 6) * 45;
            const newAngle = currentAngle + (speed / orbitRadius) * dt;
            nextX = pX + Math.cos(newAngle) * orbitRadius;
            nextY = pY + Math.sin(newAngle) * orbitRadius;
          }

          // Soft boundary containment
          const margin = 20;
          if (nextX < margin) nextX = margin;
          if (nextX > arenaSize.width - margin) nextX = arenaSize.width - margin;
          if (nextY < margin + 30) nextY = margin + 30;
          if (nextY > arenaSize.height - margin) nextY = arenaSize.height - margin;

          return {
            ...e,
            x: nextX,
            y: nextY,
          };
        });

        enemiesRef.current = nextEnemies;
        setEnemies(nextEnemies);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [movementMode, autoWanderPlayer, arenaSize]);

  // Handle manual player pointer dragging/moving
  const handleArenaPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (autoWanderPlayer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(20, Math.min(arenaSize.width - 20, e.clientX - rect.left));
    const y = Math.max(30, Math.min(arenaSize.height - 20, e.clientY - rect.top));
    setPlayerPos({ x, y });
  };

  // Mass spawn by archetype
  const spawnSpecificSwarm = (arch: EnemyArchetype, count: number) => {
    setEnemies((prev) => {
      const added: EnemyRuntimeData[] = [];
      for (let i = 0; i < count; i++) {
        added.push(createEnemy(`swarm-${arch}-${Date.now()}-${i}`, arch));
      }
      const combined = [...prev, ...added];
      setTargetCount(combined.length);
      return combined;
    });
  };

  // Spawns one of every single one of the 58 folklore enemies simultaneously!
  const spawnAll58FolkloreArmy = () => {
    const army = ALL_ENEMY_IDS.map((eid, idx) => {
      const conf = getEnemyGpuConfig(eid);
      return {
        id: `folk-${eid}-${Date.now()}-${idx}`,
        x: 40 + Math.random() * (arenaSize.width - 80),
        y: 60 + Math.random() * (arenaSize.height - 100),
        vx: 0,
        vy: 0,
        archetype: conf.archetype,
        src: conf.spriteUrl,
        baseScale: conf.params.baseScale,
        width: conf.params.width,
        height: conf.params.height,
      };
    });
    setTargetCount(army.length);
    setEnemies(army);
  };

  // Spawns multiple instances of a chosen folklore enemy
  const spawnFolkloreGroup = (enemyId: string, count = 20) => {
    const conf = getEnemyGpuConfig(enemyId);
    setEnemies((prev) => {
      const added: EnemyRuntimeData[] = [];
      for (let i = 0; i < count; i++) {
        added.push({
          id: `folk-${enemyId}-${Date.now()}-${i}`,
          x: 40 + Math.random() * (arenaSize.width - 80),
          y: 60 + Math.random() * (arenaSize.height - 100),
          vx: 0,
          vy: 0,
          archetype: conf.archetype,
          src: conf.spriteUrl,
          baseScale: conf.params.baseScale,
          width: conf.params.width,
          height: conf.params.height,
        });
      }
      const combined = [...prev, ...added];
      setTargetCount(combined.length);
      return combined;
    });
  };

  // Reset to balanced mix
  const handleResetMix = (count = 150) => {
    setTargetCount(count);
    const archs: EnemyArchetype[] = ['runner', 'slime', 'bug', 'golem'];
    const newEnemies = Array.from({ length: count }, (_, i) => {
      const arch = archs[i % archs.length];
      const preset = ARCHETYPE_PRESETS[arch];
      return {
        id: `fresh-${i + 1}`,
        x: 40 + Math.random() * (arenaSize.width - 80),
        y: 60 + Math.random() * (arenaSize.height - 100),
        vx: 0,
        vy: 0,
        archetype: arch,
        src: BAKED_SPRITES[arch],
        baseScale: preset.baseScale,
        width: preset.width,
        height: preset.height,
      };
    });
    setEnemies(newEnemies);
  };

  // Archetype distribution counts
  const archetypeCounts = useMemo(() => {
    const counts = { runner: 0, slime: 0, bug: 0, golem: 0 };
    for (const e of enemies) {
      if (e.archetype in counts) counts[e.archetype]++;
    }
    return counts;
  }, [enemies]);

  // Selected enemy for live inspector
  const selectedEnemy = useMemo(() => {
    return enemies.find((e) => e.id === selectedEnemyId) || enemies[0];
  }, [enemies, selectedEnemyId]);

  // Volume-preserving stretch computed for tuner
  const liveDerivedStretch = useMemo(() => {
    return computeVolumePreservingStretch(tunerSquashX, tunerSquashY);
  }, [tunerSquashX, tunerSquashY]);

  // Custom params applied if overrideArchetype is set
  const getEnemyCustomParams = (enemyArchetype: EnemyArchetype) => {
    if (overrideArchetype === 'all' || overrideArchetype === enemyArchetype) {
      return {
        animDuration: `${tunerDuration}s`,
        wobbleAngle: `${tunerAngle}deg`,
        squashX: tunerSquashX,
        squashY: tunerSquashY,
        stretchX: liveDerivedStretch.stretchX,
        stretchY: liveDerivedStretch.stretchY,
      };
    }
    return undefined;
  };

  return (
    <div className={`gpu-battlefield-wrapper flex flex-col gap-4 text-stone-900 select-none ${className}`}>
      {/* 1. TOP STATS BAR & REAL-TIME PERFORMANCE METRICS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF5E8] border-2 border-[#1C1610] rounded-xl p-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1C1610] text-[#FAF5E8] px-3 py-1 rounded-lg font-mono text-sm shadow-inner">
            <span className="text-amber-400 font-bold">FPS:</span>
            <span className={`font-bold ${fps >= 55 ? 'text-emerald-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
              {fps}
            </span>
            <span className="text-stone-400 text-xs">({frameTimeMs} ms)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-100/80 border border-amber-300 text-amber-950 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <span>Aktivních nepřátel:</span>
            <span className="font-mono font-bold text-amber-900 text-sm">{enemies.length}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-900 rounded border border-orange-300">
              🏃 {archetypeCounts.runner}
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded border border-emerald-300">
              🟢 {archetypeCounts.slime}
            </span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded border border-purple-300">
              🦗 {archetypeCounts.bug}
            </span>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-900 rounded border border-slate-400">
              🗿 {archetypeCounts.golem}
            </span>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={autoWanderPlayer}
              onChange={(e) => setAutoWanderPlayer(e.target.checked)}
              className="rounded accent-amber-700"
            />
            <span>Auto hrdina</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={showDeadzoneVisualizer}
              onChange={(e) => setShowDeadzoneVisualizer(e.target.checked)}
              className="rounded accent-amber-700"
            />
            <span>Zóna otočení (5px)</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={showDebugBadges}
              onChange={(e) => setShowDebugBadges(e.target.checked)}
              className="rounded accent-amber-700"
            />
            <span>Štítky</span>
          </label>
        </div>
      </div>

      {/* 2. THE 2D GPU BATTLEFIELD ARENA */}
      <div
        ref={arenaRef}
        onPointerMove={handleArenaPointerMove}
        className="relative w-full h-[520px] bg-[#EFE3C6] border-4 border-[#1C1610] rounded-2xl overflow-hidden shadow-2xl cursor-crosshair select-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(250, 245, 232, 0.4) 0%, rgba(220, 200, 160, 0.35) 100%),
            linear-gradient(to right, rgba(28, 22, 16, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(28, 22, 16, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        }}
      >
        {/* Dead zone visualizer band (±5px around playerX) */}
        {showDeadzoneVisualizer && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none border-x border-dashed border-red-500/50 bg-red-400/10 z-10 transition-all duration-75"
            style={{
              left: `${playerPos.x - 5}px`,
              width: '10px',
            }}
            title="Mrtvá zóna otáčení (5px) – v tomto pruhu se nepřítel nepřetáčí sem a tam"
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-700 text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap shadow">
              Deadzone ±5px
            </div>
          </div>
        )}

        {/* Player entity in center / mouse position */}
        <div
          className="absolute pointer-events-none z-20 flex flex-col items-center"
          style={{
            transform: `translate3d(${playerPos.x - 24}px, ${playerPos.y - 32}px, 0)`,
            transition: autoWanderPlayer ? 'none' : 'transform 0.04s linear',
          }}
        >
          {/* Pulsing player indicator */}
          <div className="w-12 h-12 rounded-full border-2 border-[#1C1610] bg-amber-400 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-xl">🤠</span>
          </div>
          <span className="bg-[#1C1610] text-[#FAF5E8] text-[10px] font-bold px-1.5 py-0.2 rounded mt-1 shadow">
            Hráč
          </span>
        </div>

        {/*
          THE HUNDREDS OF HIGH-PERFORMANCE GPU ENEMIES
          Each enemy is wrapped in React.memo and renders:
          - Outer <div>: translate3d(x, y, 0), scaleX(flipX), baseScale
          - Inner <img>: will-change, translateZ(0), pure CSS @keyframes squash/stretch/wobble
        */}
        {enemies.map((enemy) => (
          <Enemy
            key={enemy.id}
            id={enemy.id}
            x={enemy.x}
            y={enemy.y}
            playerX={playerPos.x}
            src={enemy.src}
            archetype={enemy.archetype}
            baseScale={enemy.baseScale}
            customParams={getEnemyCustomParams(enemy.archetype)}
            width={enemy.width}
            height={enemy.height}
            showDebugBadge={showDebugBadges}
            onClick={() => setSelectedEnemyId(enemy.id)}
            className={selectedEnemyId === enemy.id ? 'ring-2 ring-amber-500 rounded-full' : ''}
          />
        ))}

        {/* Ambient overlay watermark */}
        <div className="absolute bottom-3 right-3 pointer-events-none text-stone-500/60 font-mono text-xs text-right">
          <div>Procedurální GPU CSS Walk Engine</div>
          <div>Žádný JS Math.sin v rAF • Čistý DOM &lt;img&gt;</div>
        </div>
      </div>

      {/* 3. CONTROLS, SPAWNERS & LIVE ARCHETYPE TUNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panel A: Spawn & Army Controls */}
        <div className="bg-[#FAF5E8] border-2 border-[#1C1610] rounded-xl p-4 shadow flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#1C1610] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>⚔️</span> Řízení hordy a spawnu
            </h3>

            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span>Počet nepřátel na ploše:</span>
                <span className="font-mono font-bold text-amber-900">{targetCount}</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="w-full accent-amber-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>20 pěšáků</span>
                <span>250 střed</span>
                <span>500 masivní bitva</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">Chování pohybu hordy:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['chase', 'wander', 'orbit', 'freeze'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setMovementMode(mode)}
                    className={`px-2 py-1 text-xs font-semibold rounded border transition ${
                      movementMode === mode
                        ? 'bg-[#1C1610] text-[#FAF5E8] border-[#1C1610]'
                        : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {mode === 'chase' && '🎯 Pronásledování'}
                    {mode === 'wander' && '🍃 Toulání'}
                    {mode === 'orbit' && '🌀 Kroužení'}
                    {mode === 'freeze' && '🛑 Zmrazení pozice'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick preset army buttons */}
          <div className="pt-2 border-t border-stone-300">
            <span className="text-[11px] font-bold text-stone-600 block mb-1.5">Spawnovat specifickou skupinu:</span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => spawnSpecificSwarm('runner', 40)}
                className="px-2 py-1 bg-orange-100 text-orange-950 border border-orange-300 rounded font-semibold hover:bg-orange-200"
              >
                +40 Běžců
              </button>
              <button
                onClick={() => spawnSpecificSwarm('slime', 40)}
                className="px-2 py-1 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded font-semibold hover:bg-emerald-200"
              >
                +40 Slizounů
              </button>
              <button
                onClick={() => spawnSpecificSwarm('bug', 40)}
                className="px-2 py-1 bg-purple-100 text-purple-950 border border-purple-300 rounded font-semibold hover:bg-purple-200"
              >
                +40 Hmyzáků
              </button>
              <button
                onClick={() => spawnSpecificSwarm('golem', 15)}
                className="px-2 py-1 bg-slate-200 text-slate-950 border border-slate-400 rounded font-semibold hover:bg-slate-300"
              >
                +15 Golemů
              </button>
            </div>
            <button
              onClick={() => handleResetMix(150)}
              className="w-full mt-2 py-1 text-xs bg-amber-600 text-white rounded font-bold hover:bg-amber-700 shadow-sm"
            >
              🔄 Resetovat na 150 smíšených
            </button>

            {/* Complete Folklore 58 Enemies Army Section */}
            <div className="mt-2.5 pt-2 border-t border-stone-300">
              <span className="text-[11px] font-bold text-stone-800 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1">
                  <span>🏰</span> Všech 58 strašidel z Bubákova:
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-300">
                  58/58 zavedeno
                </span>
              </span>

              <button
                onClick={spawnAll58FolkloreArmy}
                className="w-full mb-2 py-1.5 px-2 bg-gradient-to-r from-red-800 via-amber-800 to-amber-900 text-white rounded font-bold text-xs shadow hover:brightness-110 flex items-center justify-center gap-1.5"
                title="Vykreslí všech 58 kanonických strašidel naráz – každé s vlastní zapečenou texturou a laděnou GPU chůzí"
              >
                <span>⚔️</span> Spawnovat VŠECH 58 strašidel najednou
              </button>

              <div className="flex gap-1.5">
                <select
                  value={selectedFolkloreId}
                  onChange={(e) => setSelectedFolkloreId(e.target.value)}
                  className="flex-1 bg-white border border-stone-300 rounded px-2 py-1 text-xs font-semibold"
                >
                  {ALL_ENEMY_IDS.map((eid) => {
                    const conf = getEnemyGpuConfig(eid);
                    return (
                      <option key={eid} value={eid}>
                        {conf.name} ({conf.archetype})
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={() => spawnFolkloreGroup(selectedFolkloreId, 20)}
                  className="px-2.5 py-1 bg-amber-700 text-white rounded font-bold text-xs hover:bg-amber-800 whitespace-nowrap shadow-sm"
                  title="Přidat 20 instancí tohoto strašidla"
                >
                  +20 ks
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel B: Live Archetype Tuner (CSS Custom Properties) */}
        <div className="bg-[#FAF5E8] border-2 border-[#1C1610] rounded-xl p-4 shadow flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#1C1610] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>🎛️</span> Živý ladicí pult (CSS Proměnné)
            </h3>

            <div className="mb-2">
              <label className="block text-xs font-medium mb-1">Cílový archetyp pro úpravu:</label>
              <select
                value={overrideArchetype}
                onChange={(e) => {
                  const val = e.target.value as EnemyArchetype | 'all';
                  setOverrideArchetype(val);
                  if (val !== 'all') {
                    const p = ARCHETYPE_PRESETS[val];
                    setTunerDuration(parseFloat(p.animDuration));
                    setTunerAngle(parseFloat(p.wobbleAngle));
                    setTunerSquashX(p.squashX);
                    setTunerSquashY(p.squashY);
                  }
                }}
                className="w-full bg-white border border-stone-300 rounded px-2 py-1 text-xs font-semibold"
              >
                <option value="all">Všechny archetypy naráz</option>
                <option value="runner">🏃 Runner (Běžec)</option>
                <option value="slime">🟢 Slime (Slizoun)</option>
                <option value="bug">🦗 Bug (Hmyzák)</option>
                <option value="golem">🗿 Golem (Těžký boss)</option>
              </select>
            </div>

            {/* Slider 1: Duration */}
            <div className="mb-2">
              <div className="flex justify-between text-xs">
                <span>Doba kroku (--anim-duration):</span>
                <span className="font-mono font-bold">{tunerDuration.toFixed(2)}s</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="2.00"
                step="0.02"
                value={tunerDuration}
                onChange={(e) => setTunerDuration(Number(e.target.value))}
                className="w-full accent-amber-700"
              />
            </div>

            {/* Slider 2: Wobble Angle */}
            <div className="mb-2">
              <div className="flex justify-between text-xs">
                <span>Úhel náklonu (--wobble-angle):</span>
                <span className="font-mono font-bold">{tunerAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={tunerAngle}
                onChange={(e) => setTunerAngle(Number(e.target.value))}
                className="w-full accent-amber-700"
              />
            </div>

            {/* Slider 3: Squash Y (vertical compression) */}
            <div className="mb-2">
              <div className="flex justify-between text-xs">
                <span>Stlačení výšky (--squash-y):</span>
                <span className="font-mono font-bold">{tunerSquashY.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.98"
                step="0.02"
                value={tunerSquashY}
                onChange={(e) => setTunerSquashY(Number(e.target.value))}
                className="w-full accent-amber-700"
              />
            </div>

            {/* Slider 4: Squash X (horizontal spread) */}
            <div className="mb-2">
              <div className="flex justify-between text-xs">
                <span>Roztažení šířky (--squash-x):</span>
                <span className="font-mono font-bold">{tunerSquashX.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.02"
                max="1.50"
                step="0.02"
                value={tunerSquashX}
                onChange={(e) => setTunerSquashX(Number(e.target.value))}
                className="w-full accent-amber-700"
              />
            </div>
          </div>

          <div className="bg-stone-100 p-2 rounded text-[11px] font-mono text-stone-700 border border-stone-200">
            <div>
              Auto objemová korekce: stretch-x: <b>{liveDerivedStretch.stretchX}</b>, stretch-y:{' '}
              <b>{liveDerivedStretch.stretchY}</b>
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              Objem zachován: Sx·Sy = {(tunerSquashX * tunerSquashY).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Panel C: Inspector of Selected Enemy */}
        <div className="bg-[#FAF5E8] border-2 border-[#1C1610] rounded-xl p-4 shadow flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#1C1610] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🔍</span> Inspektor nepřítele
              </span>
              <span className="text-[10px] text-stone-500 font-normal">Klikni na nepřítele v aréně</span>
            </h3>

            {selectedEnemy && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-stone-100 p-2 rounded-lg border border-stone-300">
                  <div className="w-14 h-14 bg-amber-50 rounded border border-stone-400 p-1 flex items-center justify-center overflow-hidden">
                    <img
                      src={selectedEnemy.src}
                      decoding="async"
                      draggable={false}
                      alt="Selected"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div>
                    {(() => {
                      const match = selectedEnemy.id.match(/^folk-([a-z_]+)-\d+/);
                      const key = match ? match[1] : selectedEnemy.id;
                      const folk = ALL_ENEMY_IDS.includes(key) ? getEnemyGpuConfig(key) : null;
                      return (
                        <>
                          <div className="font-bold text-xs text-[#1C1610]">
                            {folk ? folk.name : selectedEnemy.id}
                          </div>
                          <div className="text-xs text-amber-900 font-semibold uppercase">
                            {ARCHETYPE_PRESETS[selectedEnemy.archetype].name}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {folk ? `Kategorie: ${folk.category} | ` : ''}Rychlost: {ARCHETYPE_PRESETS[selectedEnemy.archetype].speed} px/s
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="text-xs font-mono bg-white p-2.5 rounded border border-stone-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Pozice [X, Y]:</span>
                    <span>
                      [{Math.round(selectedEnemy.x)}, {Math.round(selectedEnemy.y)}]
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Vzdálenost k hráči dx:</span>
                    <span className={Math.abs(playerPos.x - selectedEnemy.x) <= 5 ? 'text-red-600 font-bold' : ''}>
                      {Math.round(playerPos.x - selectedEnemy.x)} px
                      {Math.abs(playerPos.x - selectedEnemy.x) <= 5 && ' (V mrtvé zóně!)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Otočení (flip-x):</span>
                    <span className="font-bold">
                      {playerPos.x >= selectedEnemy.x ? '1 (Doprava ▶)' : '-1 (Doleva ◀)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Základní měřítko:</span>
                    <span>{selectedEnemy.baseScale}x</span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-600 bg-amber-50/80 p-2 rounded border border-amber-200/80">
                  <p className="font-semibold text-amber-950 mb-0.5">Mechanika chůze:</p>
                  <p className="text-[10px] leading-relaxed">
                    {ARCHETYPE_PRESETS[selectedEnemy.archetype].description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-stone-500 pt-2 border-t border-stone-200">
            Dvojvrstvá architektura: Vnější transform(x, y, flipX) odděluje směr od vnitřního GPU @keyframes squash & stretch.
          </div>
        </div>
      </div>
    </div>
  );
};
