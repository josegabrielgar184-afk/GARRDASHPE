'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Video, Loader2, CheckCircle2, XCircle, Flame } from 'lucide-react';
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
import { getActiveAdIds, shouldShowAds, checkRateLimit } from '@/lib/ad-security';
import { getFallbackRewardedId } from '@/lib/config';

interface RewardAdModalProps {
  open: boolean;
  onClose: () => void;
  onReward: () => void;
  title: string;
  rewardText: string;
  adId?: string;
  userRole?: 'user' | 'operador' | 'admin';
  vip?: boolean;
  marathonMode?: boolean;
  marathonReward?: number;
  touchKey?: string;
}

const MARATHON_CHAIN_LENGTH = 4;

export function RewardAdModal({
  open, onClose, onReward, title, rewardText, adId, userRole = 'user', vip = false,
  marathonMode = false, marathonReward = 100, touchKey,
}: RewardAdModalProps) {
  const [phase, setPhase] = useState<'loading' | 'ad' | 'reward' | 'error' | 'marathon' | 'marathon_ad' | 'marathon_reward'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [chainProgress, setChainProgress] = useState(0);
  const rewardedRef = useRef(false);
  const closedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const onRewardRef = useRef(onReward);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onRewardRef.current = onReward; }, [onReward]);

  useEffect(() => {
    if (!open) {
      setPhase('loading');
      setErrorMsg('');
      setChainProgress(0);
      rewardedRef.current = false;
      closedRef.current = false;
      return;
    }

    if (!shouldShowAds(userRole, vip)) {
      setErrorMsg('Los anuncios no estan disponibles para esta cuenta.');
      setPhase('error');
      return;
    }

    // ELIMINADO EL touchKey && shouldSkipAd PARA QUE NUNCA SE SALTE EL ANUNCIO

    if (!checkRateLimit()) {
      setErrorMsg('Has alcanzado el limite de anuncios por minuto. Intenta de nuevo mas tarde.');
      setPhase('error');
      return;
    }

    setChainProgress(0);
    rewardedRef.current = false;
    closedRef.current = false;

    if (marathonMode) {
      setPhase('marathon');
    } else {
      setPhase('loading');
      setErrorMsg('');
      loadAndShowAd();
    }
  }, [open, adId, userRole, vip, marathonMode, touchKey]);

  const loadAndShowAd = async (isMarathonStep = false) => {
    let cancelled = false;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    const Capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    const isNative = Capacitor?.isNativePlatform?.() ?? false;

    if (!isNative) {
      if (marathonMode) {
        setPhase(isMarathonStep ? 'marathon_ad' : 'ad');
        setTimeout(() => {
          if (cancelled) return;
          rewardedRef.current = true;
          handleAdComplete(isMarathonStep);
        }, 2000);
      } else {
        // En navegador web de prueba
        rewardedRef.current = true;
        onRewardRef.current();
        onCloseRef.current();
      }
      return;
    }

    const tryLoadAd = async (useAdId: string): Promise<boolean> => {
      try {
        let adWatched = false;

        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
          adWatched = true;
          rewardedRef.current = true;
        });

        const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          if (cancelled) return;
          try { rewardListener.remove(); dismissListener.remove(); } catch {}
          
          if (adWatched || rewardedRef.current) {
            handleAdComplete(isMarathonStep);
          } else {
            closedRef.current = true;
            onCloseRef.current();
          }
        });

        timeoutHandle = setTimeout(() => {
          if (cancelled) return;
          try { rewardListener.remove(); dismissListener.remove(); } catch {}
          setErrorMsg('El anuncio tardó demasiado en cargar. Revisa tu conexión e intenta de nuevo.');
          setPhase('error');
        }, 12000);

        await AdMob.prepareRewardVideoAd({ adId: useAdId });

        if (timeoutHandle) { clearTimeout(timeoutHandle); timeoutHandle = null; }

        if (cancelled) {
          rewardListener.remove();
          dismissListener.remove();
          return false;
        }

        setPhase(isMarathonStep ? 'marathon_ad' : 'ad');
        await AdMob.showRewardVideoAd();

        return true;
      } catch {
        if (timeoutHandle) { clearTimeout(timeoutHandle); timeoutHandle = null; }
        return false;
      }
    };

    try {
      const ids = getActiveAdIds();
      const primaryAdId = adId || ids.ruletaId || ids.revivirId;

      const success = await tryLoadAd(primaryAdId);

      if (!success && !cancelled) {
        const fallbackId = getFallbackRewardedId();
        if (fallbackId && fallbackId !== primaryAdId) {
          const retrySuccess = await tryLoadAd(fallbackId);
          if (!retrySuccess && !cancelled) {
            setErrorMsg('No se pudo cargar el anuncio. Verifica tu conexión a internet e intenta de nuevo.');
            setPhase('error');
          }
        } else {
          setErrorMsg('No se pudo cargar el anuncio. Verifica tu conexión a internet e intenta de nuevo.');
          setPhase('error');
        }
      }
    } catch {
      if (timeoutHandle) { clearTimeout(timeoutHandle); timeoutHandle = null; }
      if (!cancelled) {
        setErrorMsg('No se pudo cargar el anuncio. Verifica tu conexión a internet e intenta de nuevo.');
        setPhase('error');
      }
    }
  };

  const handleAdComplete = (isMarathonStep: boolean) => {
    if (isMarathonStep) {
      const next = chainProgress + 1;
      setChainProgress(next);
      if (next >= MARATHON_CHAIN_LENGTH) {
        setPhase('marathon_reward');
      } else {
        setPhase('marathon');
      }
    } else {
      onRewardRef.current();
      onCloseRef.current();
    }
  };

  const startMarathonStep = () => {
    rewardedRef.current = false;
    setPhase('loading');
    loadAndShowAd(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 animate-fade-in">
      {(phase === 'loading') && (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-primary/30 p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <p className="text-white font-bold text-lg mb-1">Preparando anuncio...</p>
          <p className="text-white/50 text-sm">Cargando recompensa</p>
        </div>
      )}

      {phase === 'ad' && (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-primary/30 p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Video className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <p className="text-white font-bold text-lg mb-1">Anuncio en reproduccion</p>
          <p className="text-white/50 text-sm">Espera a que termine para recibir tu recompensa</p>
          <button
            onClick={() => { onCloseRef.current(); }}
            className="mt-6 w-full py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 font-bold text-sm hover:bg-red-500/30 transition-colors"
          >
            Cancelar anuncio
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-red-900/40 to-gray-900 border border-red-500/40 p-8 text-center animate-scale-in">
          <div className="flex items-center justify-center mb-3">
            <XCircle className="w-16 h-16 text-red-400" />
          </div>
          <p className="text-white font-bold text-xl mb-2">Anuncio no disponible</p>
          <p className="text-red-300/70 text-sm mb-6">{errorMsg}</p>
          <button onClick={() => onClose()} className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 font-bold hover:bg-red-500/30 transition-colors">
            Cerrar
          </button>
        </div>
      )}

      {phase === 'reward' && (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-green-900/40 to-gray-900 border border-green-500/40 p-8 text-center animate-scale-in">
          <div className="flex items-center justify-center mb-3">
            <CheckCircle2 className="w-16 h-16 text-green-400" />
          </div>
          <p className="text-white font-bold text-xl mb-2">¡Recompensa obtenida!</p>
          <p className="text-green-300 text-sm mb-6">{rewardText}</p>
          <button
            onClick={() => { onRewardRef.current(); onCloseRef.current(); }}
            className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold transition-colors"
          >
            Reclamar
          </button>
        </div>
      )}

      {phase === 'marathon' && (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-amber-900/40 to-gray-900 border border-amber-500/40 p-8 text-center animate-scale-in">
          <div className="flex items-center justify-center mb-4">
            <Flame className="w-14 h-14 text-amber-400 animate-pulse" />
          </div>
          <p className="text-white font-bold text-xl mb-2">MARATON DE ANUNCIOS</p>
          <p className="text-amber-300/70 text-sm mb-4">Mira {MARATHON_CHAIN_LENGTH} videos consecutivos para ganar {marathonReward} monedas</p>

          <div className="flex items-center justify-center gap-3 mb-6">
            {Array.from({ length: MARATHON_CHAIN_LENGTH }, (_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  i < chainProgress
                    ? 'bg-green-500 border-green-400'
                    : i === chainProgress
                    ? 'bg-amber-500/20 border-amber-400 animate-pulse'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                {i < chainProgress ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white/50 text-xs font-bold">{i + 1}</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-white/40 text-xs mb-4">
            Progreso: {chainProgress}/{MARATHON_CHAIN_LENGTH} videos completados
          </p>

          {chainProgress < MARATHON_CHAIN_LENGTH && (
            <button
              onClick={startMarathonStep}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              Ver video {chainProgress + 1} de {MARATHON_CHAIN_LENGTH}
            </button>
          )}

          <button onClick={() => onClose()} className="w-full py-2 mt-2 text-white/40 text-sm hover:text-white">
            {chainProgress > 0 ? 'Abandonar cadena' : 'Cancelar'}
          </button>
        </div>
      )}

      {phase === 'marathon_ad' && (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-amber-900/40 to-gray-900 border border-amber-500/40 p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Video className="w-16 h-16 text-amber-400 animate-pulse" />
          </div>
          <p className="text-white font-bold text-lg mb-1">Video {chainProgress + 1} de {MARATHON_CHAIN_LENGTH}</p>
          <p className="text-white/50 text-sm">Espera a que termine el video</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: MARATHON_CHAIN_LENGTH }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${i < chainProgress ? 'bg-green-500' : i === chainProgress ? 'bg-amber-400 animate-pulse' : 'bg-gray-700'}`}
              />
            ))}
          </div>
        </div>
      )}

      {phase === 'marathon_reward' && (
        <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-amber-900/50 to-gray-900 border border-amber-500/60 p-8 text-center animate-scale-in">
          <div className="flex items-center justify-center mb-3">
            <Flame className="w-16 h-16 text-amber-400" />
          </div>
          <p className="text-white font-bold text-xl mb-2">¡MARATON COMPLETADO!</p>
          <p className="text-amber-300 text-sm mb-2">Has visto los {MARATHON_CHAIN_LENGTH} videos consecutivos</p>
          <p className="text-amber-400 font-bold text-2xl mb-6">+{marathonReward} MONEDAS</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            {Array.from({ length: MARATHON_CHAIN_LENGTH }, (_, i) => (
              <CheckCircle2 key={i} className="w-6 h-6 text-green-400" />
            ))}
          </div>
          <button
            onClick={() => { onRewardRef.current(); onCloseRef.current(); }}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
          >
            Reclamar {marathonReward} monedas
          </button>
        </div>
      )}
    </div>
  );
}
