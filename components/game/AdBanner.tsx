'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { ADMOB_CONFIG } from '@/lib/config';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

const MAX_RETRIES = 5;
const RETRY_BASE_MS = 2000;

export function AdBanner() {
  const { vip, isOnline } = useGame();
  const [adLoaded, setAdLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNativeRef = useRef(false);

  const showBanner = useCallback(async () => {
    try {
      await AdMob.initialize({ initializeForTesting: false });
      await AdMob.showBanner({
        adId: ADMOB_CONFIG.bannerId,
        adSize: BannerAdSize.SMART_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
      setAdLoaded(true);
      setRetryCount(0);
    } catch {
      setAdLoaded(false);
      scheduleRetry();
    }
  }, []);

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
    if (vip || !isOnline) {
      setAdLoaded(false);
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
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
    };
  }, [vip, isOnline, showBanner]);

  // Listen for online/offline events to retry immediately on reconnect
  useEffect(() => {
    if (!isNativeRef.current) return;
    const handleOnline = () => {
      if (vip) return;
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
  }, [vip, showBanner]);

  if (vip || !adLoaded) return null;

  return <div style={{ height: '50px', flexShrink: 0 }} className="admob-banner-container" />;
}
