'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { ADMOB_CONFIG } from '@/lib/config';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export function AdBanner() {
  const { vip, isOnline } = useGame();
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (vip || !isOnline) { setAdLoaded(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const Capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
        const isNative = Capacitor?.isNativePlatform?.() ?? false;
        if (!isNative) return;
        await AdMob.initialize({ initializeForTesting: false });
        await AdMob.showBanner({
          adId: ADMOB_CONFIG.bannerId,
          adSize: BannerAdSize.SMART_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
        });
        if (!cancelled) setAdLoaded(true);
      } catch {
        if (!cancelled) setAdLoaded(false);
      }
    })();
    return () => { cancelled = true; };
  }, [vip, isOnline]);

  if (vip || !adLoaded) return null;

  return <div style={{ height: '50px', flexShrink: 0 }} className="admob-banner-container" />;
}
