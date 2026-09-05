'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { getActiveAdIds, shouldShowAds, checkRateLimit } from '@/lib/ad-security';
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } from '@capacitor-community/admob';

const MAX_RETRIES = 10;
const RETRY_BASE_MS = 2000;

export function AdBanner() {
  const { vip, isOnline, userRole } = useGame();
  const [adLoaded, setAdLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNativeRef = useRef(false);
  const listenerCleanupRef = useRef<(() => void) | null>(null);

  const adsAllowed = shouldShowAds(userRole, vip);

  const showBanner = useCallback(async () => {
    if (!adsAllowed) return;
    if (!checkRateLimit()) return;
    try {
      const ids = getActiveAdIds();
      await AdMob.initialize({ initializeForTesting: !isProduction() });
      const loadListener = await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        setAdLoaded(true);
        setRetryCount(0);
      });
      const failListener = await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => {
        setAdLoaded(false);
        scheduleRetry();
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
      setRetryCount(0);
    } catch {
      setAdLoaded(false);
      scheduleRetry();
    }
  }, [adsAllowed]);

  const scheduleRetry = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    if (retryCount >= MAX_RETRIES) return;
    const delay = RETRY_BASE_MS * Math.pow(1.5, retryCount);
    retryTimerRef.current = setTimeout(() => {
      setRetryCount((c) => c + 1);
      showBanner();
    }, delay);
  }, [retryCount, showBanner]);

  useEffect(() => {
    const Capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    isNativeRef.current = Capacitor?.isNativePlatform?.() ?? false;
  }, []);

  useEffect(() => {
    if (!adsAllowed || !isOnline) {
      setAdLoaded(false);
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
      if (listenerCleanupRef.current) { listenerCleanupRef.current(); listenerCleanupRef.current = null; }
      if (isNativeRef.current) {
        AdMob.hideBanner().catch(() => {});
      }
      return;
    }
    if (!isNativeRef.current) return;

    setRetryCount(0);
    showBanner();

    return () => {
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
      if (listenerCleanupRef.current) { listenerCleanupRef.current(); listenerCleanupRef.current = null; }
    };
  }, [adsAllowed, isOnline, showBanner]);

  useEffect(() => {
    if (!isNativeRef.current) return;
    const handleOnline = () => {
      if (!adsAllowed) return;
      setRetryCount(0);
      showBanner();
    };
    const handleOffline = () => {
      setAdLoaded(false);
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [adsAllowed, showBanner]);

  useEffect(() => {
    if (!isNativeRef.current || !adsAllowed || !isOnline) return;
    const healthCheck = setInterval(() => {
      if (!adLoaded && retryCount < MAX_RETRIES) {
        showBanner();
      }
    }, 30000);
    return () => clearInterval(healthCheck);
  }, [adLoaded, retryCount, adsAllowed, isOnline, showBanner]);

  if (!adsAllowed || !adLoaded) return null;

  return <div style={{ height: '50px', flexShrink: 0 }} className="admob-banner-container" />;
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
