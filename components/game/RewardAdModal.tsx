'use client';

import React, { useState, useEffect } from 'react';
import { Video, Loader2 } from 'lucide-react';

interface RewardAdModalProps {
  open: boolean;
  onClose: () => void;
  onReward: () => void;
  title: string;
  rewardText: string;
}

export function RewardAdModal({ open, onClose, onReward, title, rewardText }: RewardAdModalProps) {
  const [phase, setPhase] = useState<'ad' | 'reward'>('ad');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!open) return;
    setPhase('ad');
    setCountdown(3);
  }, [open]);

  useEffect(() => {
    if (!open || phase !== 'ad') return;
    if (countdown <= 0) {
      setPhase('reward');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [open, phase, countdown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 animate-fade-in">
      {phase === 'ad' ? (
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
          <p className="text-white/50 text-sm">Recompensa en {countdown} segundo{countdown !== 1 ? 's' : ''}...</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-primary/70">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Cargando anuncio Reward Ad</span>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-green-900/40 to-gray-900 border border-green-500/40 p-8 text-center animate-scale-in">
          <div className="text-5xl mb-3">🎉</div>
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
