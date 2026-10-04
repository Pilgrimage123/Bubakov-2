import React, { useEffect, useRef } from 'react';

interface TouchControlsProps {
  enabled: boolean;
  active?: boolean;
  onMove: (x: number, y: number, intensity: number) => void;
  onStop: () => void;
  onTriggerUltimate: () => void;
  ultCooldown: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  enabled,
  onMove,
  onStop,
  onTriggerUltimate,
  ultCooldown,
}) => {
  const zoneRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
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

    const handlePointerDown = (e: PointerEvent) => {
      if (pointerIdRef.current !== null) return;
      pointerIdRef.current = e.pointerId;

      try {
        zone.setPointerCapture(e.pointerId);
      } catch {
        // Fallback for devices not supporting pointer capture
      }

      const rect = base.getBoundingClientRect();
      const currentCenterX = rect.left + rect.width / 2;
      const currentCenterY = rect.top + rect.height / 2;

      // If clicked inside or near default base circle, keep it in place
      if (Math.hypot(e.clientX - currentCenterX, e.clientY - currentCenterY) <= rect.width * 0.85) {
        baseCenterRef.current = {
          x: currentCenterX,
          y: currentCenterY,
        };
      } else {
        // Dynamically place base under finger, strictly clamped inside safe visible screen bounds
        const vpWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
        const vpHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const radius = rect.width / 2;

        // Guaranteed safety padding from screen borders and bottom bar
        const bottomMinClearance = Math.max(24, vpHeight * 0.1);
        const clampedX = Math.max(radius + 12, Math.min(vpWidth * 0.55, e.clientX));
        const clampedY = Math.max(radius + 12, Math.min(vpHeight - radius - bottomMinClearance, e.clientY));

        base.style.left = `${clampedX - radius}px`;
        base.style.top = `${clampedY - radius}px`;
        base.style.bottom = 'auto';

        baseCenterRef.current = {
          x: clampedX,
          y: clampedY,
        };
      }

      base.classList.add('active');
      updateKnob(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerIdRef.current) return;
      updateKnob(e.clientX, e.clientY);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId === pointerIdRef.current) {
        try {
          zone.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore
        }
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
    <div className="touch-controls-container" aria-label="Dotykové ovládání">
      {/* Joystick Zone */}
      <div ref={zoneRef} className="joystick-touch-zone" aria-hidden="true">
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

      {/* Special Ability Button (bottom right) */}
      <button
        type="button"
        className={`touch-action-btn ${isReady ? 'ready' : 'recharging'}`}
        onClick={onTriggerUltimate}
        onTouchStart={(e) => {
          e.preventDefault();
          onTriggerUltimate();
        }}
        title="Speciální schopnost lovce (⚡)"
        aria-label="Speciální schopnost lovce"
      >
        <div className="touch-ult-icon">⚡</div>
        <div className="touch-ult-label">
          {isReady ? 'BLESK!' : `${Math.ceil(ultCooldown)} s`}
        </div>
      </button>
    </div>
  );
};
