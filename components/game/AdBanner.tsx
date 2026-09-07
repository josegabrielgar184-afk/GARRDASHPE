'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { getActiveAdIds, shouldShowAds, checkRateLimit } from '@/lib/ad-security';
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } from '@capacitor-community/admob';

export function AdBanner() {
  const { vip, isOnline, userRole } = useGame();
  const [adLoaded, setAdLoaded] = useState(false);
  const isNativeRef = useRef(false);
  const listenerCleanupRef = useRef<(() => void) | null>(null);
  const loadedRef = useRef(false);

  const adsAllowed = shouldShowAds(userRole, vip);

  const showBanner = useCallback(async () => {
    if (loadedRef.current) return;
    if (!adsAllowed) return;
    if (!checkRateLimit()) return;
    loadedRef.current = true;
    try {
      const ids = getActiveAdIds();
      await AdMob.initialize({ initializeForTesting: !isProduction() });
      const loadListener = await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        setAdLoaded(true);
      });
      const failListener = await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => {
        setAdLoaded(false);
        loadedRef.current = false;
      });
      listenerCleanupRef.current = () => {
        loadListener.remove();
        failListener.remove();
      };
      await AdMob.showBanner({
        adId: ids.bannerId,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
      setAdLoaded(true);
    } catch {
      setAdLoaded(false);
      loadedRef.current = false;
    }
  }, [adsAllowed]);

  useEffect(() => {
    const Capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    isNativeRef.current = Capacitor?.isNativePlatform?.() ?? false;
  }, []);

  useEffect(() => {
    if (!adsAllowed || !isOnline) {
      setAdLoaded(false);
      loadedRef.current = false;
      if (listenerCleanupRef.current) { listenerCleanupRef.current(); listenerCleanupRef.current = null; }
      if (isNativeRef.current) {
        AdMob.hideBanner().catch(() => {});
      }
      return;
    }
    if (!isNativeRef.current) return;

    showBanner();

    return () => {
      if (listenerCleanupRef.current) { listenerCleanupRef.current(); listenerCleanupRef.current = null; }
      loadedRef.current = false;
    };
  }, [adsAllowed, isOnline, showBanner]);

  useEffect(() => {
    if (!isNativeRef.current) return;
    const handleOnline = () => {
      if (!adsAllowed) return;
      loadedRef.current = false;
      showBanner();
    };
    const handleOffline = () => {
      setAdLoaded(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [adsAllowed, showBanner]);

  if (!adsAllowed || !adLoaded) return null;

  return <div style={{ height: '50px', flexShrink: 0, background: 'transparent' }} className="admob-banner-container" />;
}

function isProduction(): boolean {
  try {
    const Capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    const isNative = Capacitor?.isNativePlatform?.() ?? false;
    return isNative && !localStorage.getItem('garrdash_dev_mode');
  } catch {
    return false;
  }
}
