'use client';

import { ADMOB_CONFIG } from '@/lib/config';

// Google official test ad IDs - these do NOT count as invalid traffic
const TEST_IDS = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  bannerId: 'ca-app-pub-3940256099942544/6300978111',
  anuncioTiempoId: 'ca-app-pub-3940256099942544/1033173712',
  revivirId: 'ca-app-pub-3940256099942544/5224354917',
  ruletaId: 'ca-app-pub-3940256099942544/5224354917',
  shopRewardedId: 'ca-app-pub-3940256099942544/5224354917',
  fallbackRewardedId: 'ca-app-pub-3940256099942544/5224354917',
};

// Rate limiting: max 10 ad loads per minute
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const adLoadTimestamps: number[] = [];

const firstTouchSet = new Set<string>();

export function isFirstTouchClean(key: string): boolean {
  if (firstTouchSet.has(key)) return false;
  firstTouchSet.add(key);
  return true;
}

export function shouldSkipAd(key: string): boolean {
  return isFirstTouchClean(key);
}

// Dev mode flag - toggled from admin settings
let devMode = false;

export function setDevMode(enabled: boolean): void {
  devMode = enabled;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('garrdash_dev_mode', enabled ? 'true' : 'false');
    }
  } catch {}
}

export function isDevMode(): boolean {
  if (devMode) return devMode;
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('garrdash_dev_mode') === 'true';
    }
  } catch {}
  return false;
}

export function isProduction(): boolean {
  const Capacitor = (typeof window !== 'undefined' ? (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor : undefined);
  const isNative = Capacitor?.isNativePlatform?.() ?? false;
  return isNative && !isDevMode();
}

export function getActiveAdIds() {
  if (isProduction()) {
    return ADMOB_CONFIG;
  }
  return TEST_IDS;
}

export function shouldShowAds(userRole: 'user' | 'operador' | 'admin', vip: boolean): boolean {
  if (userRole === 'admin' || userRole === 'operador') return false;
  if (vip) return false;
  return true;
}

export function checkRateLimit(): boolean {
  const now = Date.now();
  while (adLoadTimestamps.length > 0 && now - adLoadTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
    adLoadTimestamps.shift();
  }
  if (adLoadTimestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }
  adLoadTimestamps.push(now);
  return true;
}

export function getRateLimitStatus(): { remaining: number; resetInMs: number } {
  const now = Date.now();
  while (adLoadTimestamps.length > 0 && now - adLoadTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
    adLoadTimestamps.shift();
  }
  const remaining = Math.max(0, RATE_LIMIT_MAX - adLoadTimestamps.length);
  const resetInMs = adLoadTimestamps.length > 0
    ? RATE_LIMIT_WINDOW_MS - (now - adLoadTimestamps[0])
    : 0;
  return { remaining, resetInMs };
}
