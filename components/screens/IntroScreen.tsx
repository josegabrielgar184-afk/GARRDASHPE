'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/hooks/use-game';

export function IntroScreen() {
  const { setScreen } = useGame();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 4 + 2;
        if (next >= 100) { clearInterval(progressInterval); return 100; }
        return next;
      });
    }, 120);

    const doneTimeout = setTimeout(() => {
      setScreen('login');
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(doneTimeout);
    };
  }, [setScreen]);

  const pct = Math.round(progress);

  return (
    <div className="fixed inset-0 bg-[#050808] flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(138,155,80,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(138,155,80,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-sm px-6">
        {/* Logo */}
        <div className="mb-2 text-center">
          <h1
            className="font-black tracking-[0.15em] select-none text-5xl sm:text-6xl"
            style={{
              color: '#d4d8b8',
              textShadow: '0 0 20px rgba(138,155,80,0.5), 0 0 40px rgba(138,155,80,0.25), 0 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '0.12em',
            }}
          >
            GARRDASH
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="text-xs font-bold tracking-[0.4em] mb-12 select-none"
          style={{ color: '#8a9b50', textShadow: '0 0 10px rgba(138,155,80,0.3)' }}
        >
          ZONA DE COMBATE
        </p>

        {/* Tactical emblem */}
        <div className="mb-12 relative">
          <svg width="64" height="64" viewBox="0 0 64 64" className="opacity-60">
            <path d="M32 4 L60 32 L32 60 L4 32 Z" fill="none" stroke="#8a9b50" strokeWidth="1.5" />
            <path d="M32 12 L52 32 L32 52 L12 32 Z" fill="none" stroke="#8a9b50" strokeWidth="1" opacity="0.5" />
            <circle cx="32" cy="32" r="4" fill="#8a9b50" opacity="0.6" />
            <line x1="32" y1="4" x2="32" y2="16" stroke="#8a9b50" strokeWidth="1" opacity="0.4" />
            <line x1="32" y1="48" x2="32" y2="60" stroke="#8a9b50" strokeWidth="1" opacity="0.4" />
            <line x1="4" y1="32" x2="16" y2="32" stroke="#8a9b50" strokeWidth="1" opacity="0.4" />
            <line x1="48" y1="32" x2="60" y2="32" stroke="#8a9b50" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Progress bar section */}
      <div className="relative z-10 w-full max-w-xs px-6 pb-16">
        {/* Beveled military progress bar */}
        <div className="relative">
          {/* Outer beveled frame */}
          <div
            className="relative h-7 w-full overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1a1a14 0%, #0d0d0a 100%)',
              border: '1px solid #3a3a28',
              borderTopColor: '#4a4a32',
              borderBottomColor: '#1a1a10',
              borderLeft: 'none',
              borderRight: 'none',
              clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%)',
            }}
          >
            {/* Inner track */}
            <div className="absolute inset-0 flex items-center" style={{ clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%)' }}>
              {/* Fill */}
              <div
                className="h-full transition-all duration-150 ease-out relative"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(180deg, #8a9b50 0%, #6b7b40 50%, #4a5a28 100%)',
                  boxShadow: '0 0 8px rgba(138,155,80,0.4)',
                }}
              >
                {/* Diagonal stripe texture */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent 0px, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 6px)',
                  }}
                />
              </div>
            </div>

            {/* Percentage text overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-mono font-bold text-xs tracking-wider"
                style={{
                  color: pct > 50 ? '#0d0d0a' : '#8a9b50',
                  textShadow: pct > 50 ? 'none' : '0 0 4px rgba(138,155,80,0.4)',
                }}
              >
                {pct}%
              </span>
            </div>
          </div>
        </div>

        {/* Status text */}
        <p className="text-center mt-3 text-[10px] font-mono tracking-wider text-[#6b7b40]">
          {pct < 30 ? 'INICIANDO SISTEMAS...' : pct < 60 ? 'CARGANDO ARSENAL...' : pct < 90 ? 'SINCRONIZANDO...' : 'LISTO PARA COMBATE'}
        </p>
      </div>
    </div>
  );
}
