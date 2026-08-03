'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { ADMOB_CONFIG } from '@/lib/config';

type AdMobPlugin = {
  AdMob?: {
    showBanner: (opts: Record<string, unknown>) => Promise<void>;
    hideBanner: (opts: Record<string, unknown>) => Promise<void>;
    init: (opts: Record<string, unknown>) => Promise<void>;
  };
};

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
        let plugin: AdMobPlugin['AdMob'] | undefined;
        try {
          const mod = await (eval('import')('@capacitor-community/admob'));
          plugin = (mod as unknown as AdMobPlugin).AdMob;
        } catch { return; }
        if (!plugin) return;
        if (!plugin) return;
        await plugin.init({
          requestTrackingAuthorization: true,
          initializeForTesting: false,
        });
        await plugin.showBanner({
          adId: ADMOB_CONFIG.bannerId,
          adSize: 'SMART_BANNER',
          position: 'BOTTOM_CENTER',
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
