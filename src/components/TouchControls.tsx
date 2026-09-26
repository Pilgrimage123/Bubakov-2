import React, { useEffect, useRef } from 'react';

interface TouchControlsProps {
  enabled: boolean;
  active: boolean;
  onMove: (x: number, y: number, intensity: number) => void;
  onStop: () => void;
  onTriggerUltimate: () => void;
  ultCooldown: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  enabled,
  active,
  onMove,
  onStop,
  onTriggerUltimate,
  ultCooldown,
}) => {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const baseRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const baseCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const zone = zoneRef.current;
    const base = baseRef.current;
    const knob = knobRef.current;
    if (!zone || !base || !knob) return;

    const resetJoystick = () => {
      pointerIdRef.current = null;
      knob.style.transform = 'translate(0px, 0px)';
      base.classList.remove('active');
      base.style.left = '';
      base.style.top = '';
      base.style.bottom = '';
      onStop();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (pointerIdRef.current !== null) return;
      pointerIdRef.current = e.pointerId;
      try {
        zone.setPointerCapture(e.pointerId);
      } catch {}

      const rect = base.getBoundingClientRect();
      const currentCenterX = rect.left + rect.width / 2;
      const currentCenterY = rect.top + rect.height / 2;

      // If clicked near base, keep base there. Otherwise move base to touch point
      if (Math.hypot(e.clientX - currentCenterX, e.clientY - currentCenterY) <= rect.width * 0.85) {
        baseCenterRef.current = { x: currentCenterX, y: currentCenterY };
      } else {
        const radius = rect.width / 2;
        const clampedX = Math.max(radius + 8, Math.min(window.innerWidth - radius - 8, e.clientX));
        const clampedY = Math.max(radius + 8, Math.min(window.innerHeight - radius - 8, e.clientY));
        base.style.left = `${clampedX - radius}px`;
        base.style.top = `${clampedY - radius}px`;
        base.style.bottom = 'auto';
        baseCenterRef.current = { x: clampedX, y: clampedY };
      }

      base.classList.add('active');
      updateKnob(e.clientX, e.clientY);
    };

    const updateKnob = (clientX: number, clientY: number) => {
      const dx = clientX - baseCenterRef.current.x;
      const dy = clientY - baseCenterRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        const maxDist = 52;
        const clampedDist = Math.min(dist, maxDist);
        const angle = Math.atan2(dy, dx);
        const kx = Math.cos(angle) * clampedDist;
        const ky = Math.sin(angle) * clampedDist;

        knob.style.transform = `translate(${kx}px, ${ky}px)`;
        onMove(kx / maxDist, ky / maxDist, clampedDist / maxDist);
      } else {
        knob.style.transform = 'translate(0px, 0px)';
        onMove(0, 0, 0);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerIdRef.current) return;
      updateKnob(e.clientX, e.clientY);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId === pointerIdRef.current) {
        try {
          zone.releasePointerCapture(e.pointerId);
        } catch {}
        resetJoystick();
      }
    };

    zone.addEventListener('pointerdown', handlePointerDown);
    zone.addEventListener('pointermove', handlePointerMove);
    zone.addEventListener('pointerup', handlePointerUp);
    zone.addEventListener('pointercancel', handlePointerUp);

    return () => {
      zone.removeEventListener('pointerdown', handlePointerDown);
      zone.removeEventListener('pointermove', handlePointerMove);
      zone.removeEventListener('pointerup', handlePointerUp);
      zone.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [enabled, onMove, onStop]);

  if (!enabled) return null;

  const isReady = ultCooldown <= 0;

  return (
    <div className="touch-controls-container">
      {/* Floating touch zone for movement joystick */}
      <div ref={zoneRef} className="joystick-touch-zone">
        <div ref={baseRef} className="joystick-base">
          <span className="joystick-mark joy-mark-n">▲</span>
          <span className="joystick-mark joy-mark-s">▼</span>
          <span className="joystick-mark joy-mark-w">◀</span>
          <span className="joystick-mark joy-mark-e">▶</span>
          <div ref={knobRef} className="joystick-knob">
            <div className="joystick-knob-core" />
          </div>
        </div>
      </div>

      {/* Touch Action Button for Ultimate */}
      <button
        className={`touch-action-btn ${isReady ? 'ready' : 'recharging'}`}
        onClick={onTriggerUltimate}
        title="Speciální schopnost lovce (⚡)"
      >
        <div className="touch-ult-icon">⚡</div>
        <div className="touch-ult-label">
          {isReady ? 'BLESK!' : `${Math.ceil(ultCooldown)} s`}
        </div>
      </button>
    </div>
  );
};
