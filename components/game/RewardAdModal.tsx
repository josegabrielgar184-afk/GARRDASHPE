'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Video, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
import { ADMOB_CONFIG } from '@/lib/config';

interface RewardAdModalProps {
  open: boolean;
  onClose: () => void;
  onReward: () => void;
  title: string;
  rewardText: string;
  adId?: string;
}

export function RewardAdModal({ open, onClose, onReward, title, rewardText, adId }: RewardAdModalProps) {
  const [phase, setPhase] = useState<'loading' | 'ad' | 'reward' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const rewardedRef = useRef(false);
  const closedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setPhase('loading');
      setErrorMsg('');
      rewardedRef.current = false;
      closedRef.current = false;
      return;
    }

    setPhase('loading');
    setErrorMsg('');
    rewardedRef.current = false;
    closedRef.current = false;

    let cancelled = false;

    (async () => {
      const Capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
      const isNative = Capacitor?.isNativePlatform?.() ?? false;

      if (!isNative) {
        // Web fallback: no real AdMob on web, show error
        if (!cancelled) {
          setErrorMsg('Los anuncios solo estan disponibles en la app movil.');
          setPhase('error');
        }
        return;
      }

      try {
        // Listen for reward earned
        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
          rewardedRef.current = true;
        });

        // Listen for dismiss
        const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          if (cancelled) return;
          if (rewardedRef.current) {
            setPhase('reward');
          } else {
            closedRef.current = true;
            onClose();
          }
        });

        // Prepare the rewarded ad - use provided adId or fall back to revivirId
        await AdMob.prepareRewardVideoAd({
          adId: adId || ADMOB_CONFIG.revivirId,
        });

        if (cancelled) {
          rewardListener.remove();
          dismissListener.remove();
          return;
        }

        // Show the ad
        setPhase('ad');
        await AdMob.showRewardVideoAd();

        rewardListener.remove();
        dismissListener.remove();
      } catch {
        if (!cancelled) {
          setErrorMsg('No se pudo cargar el anuncio. Intenta de nuevo.');
          setPhase('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, onClose]);

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
            <Video className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <p className="text-white font-bold text-lg mb-1">Anuncio en reproduccion</p>
          <p className="text-white/50 text-sm">Espera a que termine para recibir tu recompensa</p>
        </div>
      ) : phase === 'error' ? (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-red-900/40 to-gray-900 border border-red-500/40 p-8 text-center animate-scale-in">
          <div className="flex items-center justify-center mb-3">
            <XCircle className="w-16 h-16 text-red-400" />
          </div>
          <p className="text-white font-bold text-xl mb-2">Anuncio no disponible</p>
          <p className="text-red-300/70 text-sm mb-6">{errorMsg}</p>
          <button
            onClick={() => { onClose(); }}
            className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 font-bold hover:bg-red-500/30 transition-colors"
          >
            Cerrar
          </button>
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
