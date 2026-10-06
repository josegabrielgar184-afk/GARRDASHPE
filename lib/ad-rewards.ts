'use client';

const COINS_PER_AD = 80;
const MAX_COIN_ADS_PER_DAY = 5;
const ADS_PER_KEY = 3;
const MAX_KEYS_PER_DAY = 3;

const COIN_AD_KEY = 'garrdash_coin_ads';
const KEY_AD_KEY = 'garrdash_key_ad_progress';
const KEY_DAY_KEY = 'garrdash_key_ad_day';
const KEY_DAY_COUNT_KEY = 'garrdash_key_ad_day_count';

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getCoinAdStatus(): { count: number; remaining: number; date: string } {
  try {
    const raw = localStorage.getItem(COIN_AD_KEY);
    if (!raw) return { count: 0, remaining: MAX_COIN_ADS_PER_DAY, date: getToday() };
    const data = JSON.parse(raw);
    if (data.date !== getToday()) {
      return { count: 0, remaining: MAX_COIN_ADS_PER_DAY, date: getToday() };
    }
    return { count: data.count ?? 0, remaining: MAX_COIN_ADS_PER_DAY - (data.count ?? 0), date: data.date };
  } catch {
    return { count: 0, remaining: MAX_COIN_ADS_PER_DAY, date: getToday() };
  }
}

export function recordCoinAd(): boolean {
  const status = getCoinAdStatus();
  if (status.remaining <= 0) return false;
  const newCount = status.count + 1;
  localStorage.setItem(COIN_AD_KEY, JSON.stringify({ count: newCount, date: getToday() }));
  return true;
}

export function getCoinAdReward(): number {
  return COINS_PER_AD;
}

export function getMaxCoinAdsPerDay(): number {
  return MAX_COIN_ADS_PER_DAY;
}

function getKeyDayCount(): number {
  try {
    const day = localStorage.getItem(KEY_DAY_KEY);
    if (day !== getToday()) return 0;
    return parseInt(localStorage.getItem(KEY_DAY_COUNT_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function getKeysRemainingToday(): number {
  return Math.max(0, MAX_KEYS_PER_DAY - getKeyDayCount());
}

export function getKeyAdProgress(): { adsWatched: number; adsNeeded: number } {
  try {
    const raw = localStorage.getItem(KEY_AD_KEY);
    if (!raw) return { adsWatched: 0, adsNeeded: ADS_PER_KEY };
    const count = parseInt(raw, 10) || 0;
    return { adsWatched: count % ADS_PER_KEY, adsNeeded: ADS_PER_KEY };
  } catch {
    return { adsWatched: 0, adsNeeded: ADS_PER_KEY };
  }
}

export function recordKeyAd(): { earnedKey: boolean; newProgress: number; adsNeeded: number; keysRemainingToday: number } {
  if (getKeysRemainingToday() <= 0 && getKeyAdProgress().adsWatched === 0) {
    return { earnedKey: false, newProgress: 0, adsNeeded: ADS_PER_KEY, keysRemainingToday: 0 };
  }
  const current = getKeyAdProgress();
  const newWatched = current.adsWatched + 1;
  const earnedKey = newWatched >= ADS_PER_KEY;
  const stored = earnedKey ? 0 : newWatched;
  localStorage.setItem(KEY_AD_KEY, String(stored));
  if (earnedKey) {
    const todayCount = getKeyDayCount() + 1;
    localStorage.setItem(KEY_DAY_KEY, getToday());
    localStorage.setItem(KEY_DAY_COUNT_KEY, String(todayCount));
  }
  return { earnedKey, newProgress: stored, adsNeeded: ADS_PER_KEY, keysRemainingToday: getKeysRemainingToday() };
}

export function getAdsPerKey(): number {
  return ADS_PER_KEY;
}

export function getMaxKeysPerDay(): number {
  return MAX_KEYS_PER_DAY;
}
