import React, { useEffect, useState } from 'react';
import type {
  SunComputedFrameState,
  SunOverlayConfig,
  SunVisualPhaseId,
} from '../render/sunForegroundRenderer';
import {
  SUN_RUN_DURATION_SECONDS,
  SUN_VISUAL_PHASES,
} from '../render/sunForegroundRenderer';

export interface SunDebugLiveTelemetry {
  fps: number;
  projectileCount: number;
  enemyCount: number;
  gameTimeSeconds: number;
}

interface SunDebugHudPanelProps {
  configRef: React.MutableRefObject<SunOverlayConfig>;
  sunStateRef: React.MutableRefObject<SunComputedFrameState>;
  getTelemetry: () => SunDebugLiveTelemetry;
  onToggleStressTest: (enabled: boolean) => void;
}

function formatClock(seconds: number): string {
  const clamped = Math.max(
    0,
    Math.min(SUN_RUN_DURATION_SECONDS, Math.floor(seconds))
  );
  const m = Math.floor(clamped / 60)
    .toString()
    .padStart(2, '0');
  const s = (clamped % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export const SunDebugHudPanel: React.FC<SunDebugHudPanelProps> = ({
  configRef,
  sunStateRef,
  getTelemetry,
  onToggleStressTest,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [manualTime, setManualTime] = useState<number | null>(
    configRef.current.manualTimeSeconds
  );
  const [parallaxStrength, setParallaxStrength] = useState<number>(
    configRef.current.parallaxStrength
  );
  const [deadzoneRadius, setDeadzoneRadius] = useState<number>(
    configRef.current.deadzoneRadius
  );
  const [showDeadzoneRing, setShowDeadzoneRing] = useState<boolean>(
    configRef.current.showDeadzoneDebugRing
  );
  const [stressTestActive, setStressTestActive] = useState<boolean>(
    configRef.current.stressTestActive
  );

  const [snapshot, setSnapshot] = useState<{
    fps: number;
    projectileCount: number;
    enemyCount: number;
    effectiveTimeSeconds: number;
    alpha: number;
    distanceToCenter: number;
    wasRepelled: boolean;
    activePhaseId: SunVisualPhaseId;
    activePhaseLabel: string;
    activeClockLabel: string;
  }>(() => ({
    fps: 60,
    projectileCount: 0,
    enemyCount: 0,
    effectiveTimeSeconds: 0,
    alpha: 0.9,
    distanceToCenter: 280,
    wasRepelled: false,
    activePhaseId: 'sunrise',
    activePhaseLabel: 'Východ slunce',
    activeClockLabel: '6:00',
  }));

  // Lightweight 160ms UI poll for the debug HUD — keeps the 60+ FPS rAF loop 100% free of React setState calls
  useEffect(() => {
    const interval = window.setInterval(() => {
      const telemetry = getTelemetry();
      const s = sunStateRef.current;
      setSnapshot({
        fps: telemetry.fps,
        projectileCount: telemetry.projectileCount,
        enemyCount: telemetry.enemyCount,
        effectiveTimeSeconds: s.effectiveTimeSeconds,
        alpha: s.alpha,
        distanceToCenter: Math.round(s.distanceToCenter),
        wasRepelled: s.wasRepelled,
        activePhaseId: s.activePhaseId,
        activePhaseLabel: s.activePhaseLabel,
        activeClockLabel: s.activeClockLabel,
      });
    }, 160);
    return () => window.clearInterval(interval);
  }, [getTelemetry, sunStateRef]);

  const displayedTime =
    manualTime !== null ? manualTime : snapshot.effectiveTimeSeconds;

  return (
    <aside
      id="sun-debug-hud-panel"
      aria-label="Ladicí panel slunce v popředí"
      className="fixed left-3 top-[146px] z-40 w-[332px] select-none rounded-lg border-2 border-[#231409] bg-[#1E1915]/92 p-3 text-[#FAF6ED] shadow-[3px_3px_0_#231409] backdrop-blur-xs"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#F59E0B]/30 pb-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-extrabold tracking-wide text-[#FDE047]">
            Slunce v popředí · {snapshot.activePhaseLabel} (
            {snapshot.activeClockLabel})
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#D6D3D1] tabular-nums">
            <span
              className={
                snapshot.fps >= 50
                  ? 'font-bold text-[#4ADE80]'
                  : snapshot.fps >= 30
                    ? 'font-bold text-[#FBBF24]'
                    : 'font-bold text-[#F87171]'
              }
            >
              {snapshot.fps} FPS
            </span>
            <span aria-hidden="true">·</span>
            <span>Střely: {snapshot.projectileCount}</span>
            <span aria-hidden="true">·</span>
            <span>α {snapshot.alpha.toFixed(2)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="shrink-0 whitespace-nowrap rounded border border-[#F59E0B]/50 bg-[#2D241E] px-2 py-1 text-[11px] font-bold text-[#FDE68A] transition-colors hover:bg-[#3E3128]"
        >
          {collapsed ? 'Rozbalit' : 'Sbalit'}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-2.5 flex flex-col gap-2.5 text-xs">
          {/* 1. 5-Minute Diegetic Arc Scrubber + 7 Daily Phase Presets */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="sun-time-slider"
                className="font-semibold text-[#FEF3C7]"
              >
                Denní proměna (0:00 – 5:00)
              </label>
              <div className="flex items-center gap-1.5 tabular-nums">
                <span className="font-bold text-[#FBBF24]">
                  {formatClock(displayedTime)}
                </span>
                {manualTime !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      configRef.current.manualTimeSeconds = null;
                      setManualTime(null);
                    }}
                    className="whitespace-nowrap rounded bg-[#451A03] px-1.5 py-0.5 text-[10px] font-bold text-[#FDE68A] hover:bg-[#78350F]"
                    title="Vrátit posun slunce na živý herní čas"
                  >
                    Živý čas
                  </button>
                )}
              </div>
            </div>
            <input
              id="sun-time-slider"
              type="range"
              min={0}
              max={SUN_RUN_DURATION_SECONDS}
              step={1}
              value={Math.round(displayedTime)}
              onChange={(e) => {
                const val = Number(e.target.value);
                configRef.current.manualTimeSeconds = val;
                setManualTime(val);
              }}
              className="h-2 w-full cursor-pointer accent-[#F59E0B]"
            />
            <div
              className="grid grid-cols-7 gap-1 pt-0.5"
              role="group"
              aria-label="Klíčové denní fáze slunce"
            >
              {SUN_VISUAL_PHASES.map((phase) => {
                const isActive = snapshot.activePhaseId === phase.id;
                return (
                  <button
                    key={phase.id}
                    type="button"
                    title={`${phase.label} (${phase.clockLabel})`}
                    onClick={() => {
                      configRef.current.manualTimeSeconds =
                        phase.defaultTimeSeconds;
                      setManualTime(phase.defaultTimeSeconds);
                    }}
                    className={`rounded border px-1 py-0.5 text-[10px] font-bold tabular-nums transition-colors ${
                      isActive
                        ? 'border-[#FDE047] bg-[#B45309] text-[#FEF9C3]'
                        : 'border-[#F59E0B]/30 bg-[#292019] text-[#D6D3D1] hover:bg-[#3E3025]'
                    }`}
                  >
                    {phase.clockLabel.replace(':00', 'h')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Parallax Strength Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="sun-parallax-slider"
                className="font-semibold text-[#FEF3C7]"
              >
                Síla paralaxu kamery
              </label>
              <span className="font-bold text-[#FBBF24] tabular-nums">
                {parallaxStrength.toFixed(2)}×
              </span>
            </div>
            <input
              id="sun-parallax-slider"
              type="range"
              min={0}
              max={2.5}
              step={0.05}
              value={parallaxStrength}
              onChange={(e) => {
                const val = Number(e.target.value);
                configRef.current.parallaxStrength = val;
                setParallaxStrength(val);
              }}
              className="h-2 w-full cursor-pointer accent-[#F59E0B]"
            />
          </div>

          {/* 3. Repulsive Deadzone Radius Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="sun-deadzone-slider"
                className="font-semibold text-[#FEF3C7]"
              >
                Ochranná deadzóna hráče
              </label>
              <span className="font-bold text-[#FBBF24] tabular-nums">
                {deadzoneRadius} px
              </span>
            </div>
            <input
              id="sun-deadzone-slider"
              type="range"
              min={140}
              max={420}
              step={5}
              value={deadzoneRadius}
              onChange={(e) => {
                const val = Number(e.target.value);
                configRef.current.deadzoneRadius = val;
                setDeadzoneRadius(val);
              }}
              className="h-2 w-full cursor-pointer accent-[#F59E0B]"
            />
            <div className="flex items-center justify-between pt-0.5 text-[11px] text-[#D6D3D1] tabular-nums">
              <span>
                Od středu: {snapshot.distanceToCenter} px
                {snapshot.wasRepelled ? ' (Odtlačeno)' : ''}
              </span>
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-[#FDE68A]">
                <input
                  type="checkbox"
                  checked={showDeadzoneRing}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    configRef.current.showDeadzoneDebugRing = checked;
                    setShowDeadzoneRing(checked);
                  }}
                  className="cursor-pointer accent-[#F59E0B]"
                />
                <span>Zobrazit kruh</span>
              </label>
            </div>
          </div>

          {/* 4. Bullet-Heaven Stress Test Toggle */}
          <div className="flex items-center justify-between gap-2 border-t border-[#F59E0B]/25 pt-2">
            <button
              type="button"
              onClick={() => {
                const next = !stressTestActive;
                configRef.current.stressTestActive = next;
                setStressTestActive(next);
                onToggleStressTest(next);
              }}
              className={`w-full whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-extrabold transition-colors ${
                stressTestActive
                  ? 'border-[#FCA5A5] bg-[#DC2626] text-white hover:bg-[#B91C1C]'
                  : 'border-[#F59E0B] bg-[#78350F] text-[#FEF3C7] hover:bg-[#92400E]'
              }`}
            >
              {stressTestActive
                ? 'Zastavit stres-test projektilů'
                : 'Spustit stres-test (300+ projektilů)'}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
