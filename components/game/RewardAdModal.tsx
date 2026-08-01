'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Video, Loader2, CheckCircle2 } from 'lucide-react';

interface RewardAdModalProps {
  open: boolean;
  onClose: () => void;
  onReward: () => void;
  title: string;
  rewardText: string;
}

export function RewardAdModal({ open, onClose, onReward, title, rewardText }: RewardAdModalProps) {
  const [phase, setPhase] = useState<'loading' | 'ad' | 'reward'>('loading');
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase('loading');
      setProgress(0);
      setCountdown(5);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }

    setPhase('loading');
    setProgress(0);
    setCountdown(5);

    const loadDelay = 1500 + Math.random() * 1500;
    const loadTimer = setTimeout(() => {
      setPhase('ad');
      const startTime = Date.now();
      const duration = 5000;

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min((elapsed / duration) * 100, 100);
        setProgress(pct);
        const remaining = Math.ceil((duration - elapsed) / 1000);
        setCountdown(remaining > 0 ? remaining : 0);

        if (elapsed >= duration) {
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          setPhase('reward');
        }
      }, 100);
    }, loadDelay);

    return () => {
      clearTimeout(loadTimer);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 animate-fade-in">
      {phase === 'loading' ? (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-primary/30 p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <p className="text-white font-bold text-lg mb-1">Preparando anuncio...</p>
          <p className="text-white/50 text-sm">Cargando recompensa</p>
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
          <p className="text-white font-bold text-lg mb-1">Anuncio de Video</p>
          <p className="text-white/50 text-sm mb-4">Recompensa en {countdown} segundo{countdown !== 1 ? 's' : ''}...</p>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-white/30 text-xs mt-3">Simulacion de anuncio (Web Preview)</p>
        </div>
      ) : (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-green-900/40 to-gray-900 border border-green-500/40 p-8 text-center animate-scale-in">
          <div className="flex items-center justify-center mb-3">
            <CheckCircle2 className="w-16 h-16 text-green-400" />
          </div>
          <p className="text-white font-bold text-xl mb-2">¡Recompensa obtenida!</p>
          <p className="text-green-300 text-sm mb-6">{rewardText}</p>
          <button
            onClick={() => {
              onReward();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold transition-colors"
          >
            Reclamar
          </button>
        </div>
      )}
    </div>
  );
}
