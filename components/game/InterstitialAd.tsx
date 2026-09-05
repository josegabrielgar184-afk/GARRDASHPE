'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { getActiveAdIds, shouldShowAds, checkRateLimit } from '@/lib/ad-security';
import { AdMob } from '@capacitor-community/admob';

export function InterstitialAd({ onDone }: { onDone: () => void }) {
  const { isOnline, userRole, vip } = useGame();
  const [showLoading, setShowLoading] = useState(true);
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!shouldShowAds(userRole, vip)) { if (!cancelled) { doneRef.current = true; onDone(); } return; }
      if (!isOnline) { if (!cancelled) { doneRef.current = true; onDone(); } return; }
      if (!checkRateLimit()) { if (!cancelled) { doneRef.current = true; onDone(); } return; }
      try {
        const Capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
        const isNative = Capacitor?.isNativePlatform?.() ?? false;
        if (!isNative) { if (!cancelled) { doneRef.current = true; onDone(); } return; }

        const ids = getActiveAdIds();
        await AdMob.prepareInterstitial({ adId: ids.anuncioTiempoId });
        if (cancelled) return;
        await AdMob.showInterstitial();
        if (cancelled) return;
        doneRef.current = true;
        onDone();
      } catch {
        if (!cancelled) { doneRef.current = true; onDone(); }
      } finally {
        if (!cancelled) setShowLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [onDone, isOnline, userRole, vip]);

  if (!showLoading || doneRef.current) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 animate-fade-in pointer-events-none">
      <div className="w-full max-w-sm mx-4 rounded-2xl bg-card border border-primary/30 p-8 text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">Cargando...</p>
      </div>
    </div>
  );
}
