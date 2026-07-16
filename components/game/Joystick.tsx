'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface JoystickProps {
  onMove: (dx: number, dy: number) => void;
  size?: number;
}

export function Joystick({ onMove, size = 120 }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const touchId = useRef<number | null>(null);
  const center = useRef({ x: 0, y: 0 });
  const keysRef = useRef<Set<string>>(new Set());
  const maxR = size / 2;

  const applyMove = useCallback((dx: number, dy: number) => {
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxR);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;
    setKnobPos({ x: kx, y: ky });
    onMove(Math.max(-1, Math.min(1, dx / maxR)), Math.max(-1, Math.min(1, dy / maxR)));
  }, [onMove, maxR]);

  const handleStart = useCallback((clientX: number, clientY: number, id: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    touchId.current = id;
    setActive(true);
    handleMove(clientX, clientY);
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - center.current.x;
    const dy = clientY - center.current.y;
    applyMove(dx, dy);
  }, [applyMove]);

  const handleEnd = useCallback(() => {
    touchId.current = null;
    setActive(false);
    setKnobPos({ x: 0, y: 0 });
    onMove(0, 0);
  }, [onMove]);

  // Keyboard WASD + arrow keys — move the knob physically
  useEffect(() => {
    const updateFromKeys = () => {
      const keys = keysRef.current;
      if (keys.size === 0) return;
      let dx = 0, dy = 0;
      if (keys.has('w') || keys.has('arrowup')) dy -= 1;
      if (keys.has('s') || keys.has('arrowdown')) dy += 1;
      if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
      if (keys.has('d') || keys.has('arrowright')) dx += 1;
      if (dx !== 0 || dy !== 0) {
        applyMove(dx * maxR, dy * maxR);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysRef.current.add(key);
        updateFromKeys();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysRef.current.delete(key);
        if (keysRef.current.size === 0) {
          handleEnd();
        } else {
          updateFromKeys();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [applyMove, handleEnd, maxR]);

  // Touch/mouse listeners
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (touchId.current === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (t.identifier === touchId.current) {
          handleMove(t.clientX, t.clientY);
          break;
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchId.current === null) return;
      let still = false;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchId.current) { still = true; break; }
      }
      if (!still) handleEnd();
    };
    const onMouseMove = (e: MouseEvent) => {
      if (touchId.current !== -1) return;
      if (!active) return;
      handleMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      if (active) handleEnd();
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleMove, handleEnd, active]);

  return (
    <div
      ref={baseRef}
      className="relative rounded-full border-2 border-cyan-400/40 bg-black/40 backdrop-blur-sm touch-none"
      style={{ width: size, height: size, boxShadow: '0 0 12px rgba(34,211,238,0.3)' }}
      onTouchStart={(e) => {
        e.preventDefault();
        const t = e.touches[0];
        handleStart(t.clientX, t.clientY, t.identifier);
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY, -1);
      }}
    >
      <div
        className="absolute rounded-full bg-cyan-400/80 border-2 border-white/60 shadow-lg"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${knobPos.x}px), calc(-50% + ${knobPos.y}px))`,
          boxShadow: '0 0 16px rgba(34,211,238,0.6)',
        }}
      />
    </div>
  );
}
