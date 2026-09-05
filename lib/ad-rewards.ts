'use client';

const COINS_PER_AD = 50;
const MAX_COIN_ADS_PER_DAY = 5;
const ADS_PER_KEY = 3;

const COIN_AD_KEY = 'garrdash_coin_ads';
const KEY_AD_KEY = 'garrdash_key_ad_progress';

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

export function recordKeyAd(): { earnedKey: boolean; newProgress: number; adsNeeded: number } {
  const current = getKeyAdProgress();
  const newWatched = current.adsWatched + 1;
  const earnedKey = newWatched >= ADS_PER_KEY;
  const stored = earnedKey ? 0 : newWatched;
  localStorage.setItem(KEY_AD_KEY, String(stored));
  return { earnedKey, newProgress: stored, adsNeeded: ADS_PER_KEY };
}

export function getAdsPerKey(): number {
  return ADS_PER_KEY;
}
