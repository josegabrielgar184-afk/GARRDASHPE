'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Video, CheckCircle2, X } from 'lucide-react';

export function InterstitialAd({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'loading' | 'ad' | 'done'>('loading');
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPhase('loading');
    setProgress(0);
    setCountdown(3);

    const loadTimer = setTimeout(() => {
      setPhase('ad');
      const startTime = Date.now();
      const duration = 3000;

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min((elapsed / duration) * 100, 100);
        setProgress(pct);
        const remaining = Math.ceil((duration - elapsed) / 1000);
        setCountdown(remaining > 0 ? remaining : 0);

        if (elapsed >= duration) {
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          setPhase('done');
          setTimeout(() => onDone(), 800);
        }
      }, 100);
    }, 1200);

    return () => {
      clearTimeout(loadTimer);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 animate-fade-in">
      {phase === 'loading' ? (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-primary/30 p-8 text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-white font-bold text-lg mb-1">Cargando anuncio...</p>
          <p className="text-white/50 text-sm">Anuncio a pantalla completa</p>
        </div>
      ) : phase === 'ad' ? (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-primary/30 p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Video className="w-16 h-16 text-primary animate-pulse" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {countdown}
              </span>
            </div>
          </div>
          <p className="text-white font-bold text-lg mb-1">Anuncio Interstitial</p>
          <p className="text-white/50 text-sm mb-4">Pantalla completa - {countdown}s</p>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-white/30 text-xs mt-3">Simulacion (Web Preview)</p>
        </div>
      ) : (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-green-500/40 p-8 text-center animate-scale-in">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-3" />
          <p className="text-white font-bold text-lg mb-1">Anuncio completado</p>
          <p className="text-white/50 text-sm">Continuando...</p>
        </div>
      )}
    </div>
  );
}
