export const MODO_PRUEBA = false;

export const VIP_DISPONIBLE_PLAYSTORE = false;
export const VIP_DURATION_DAYS = 60;
export const VIP_PRODUCT_ID = 'pase_vip_60dias';
export const VIP_PRICE_USD = 3;
export const VIP_PRICE_PEN = 11.50;
export const VIP_COIN_MULTIPLIER = 1.5;
export const VIP_FREE_ROULETTE_SPINS = 3;

// ============================================================================
// ADMOB MANUAL ID CONFIGURATION
// ============================================================================
// To use your own AdMob IDs, replace the string values in the "else" branches
// (the ones after the colon ":") below. Keep MODO_PRUEBA = false to use them.
//
// File: lib/config.ts
// Lines: 11-27 (the ADMOB_CONFIG block)
//
// Replace each ID after the colon with your real AdMob ID:
//   appId:          Your AdMob App ID (ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX)
//   bannerId:       Your Banner Ad Unit ID (ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX)
//   anuncioTiempoId: Your Interstitial Ad Unit ID (ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX)
//   revivirId:      Your Rewarded Ad Unit ID for "Revive" (ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX)
//   ruletaId:       Your Rewarded Ad Unit ID for "Ruleta" (ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX)
// ============================================================================
export const ADMOB_CONFIG = {
  appId: "ca-app-pub-4019857759287283~XXXXXXXXXX",
  bannerId: "ca-app-pub-4019857759287283/9166507177",
  anuncioTiempoId: "ca-app-pub-4019857759287283/9604799919",
  revivirId: "ca-app-pub-4019857759287283/4624626939",
  ruletaId: "ca-app-pub-4019857759287283/3914180497",
};

export const AYET_STUDIOS_CONFIG = {
  apiKey: 'a07d2e3f-7b1c-4e2d-9f6a-8b5c3d2e1f0a',
  secret: '92825296fad7e0d6c7d25d69c1af3b9e',
  offerwallUrl: 'https://www.ayetstudios.com/offers?apiKey=a07d2e3f-7b1c-4e2d-9f6a-8b5c3d2e1f0a',
};

export const BITLABS_CONFIG = {
  integrationToken: '6d280d69-7c5e-4c8a-aab0-d84c1abe9526',
  secret: 'jXWzcobXqHkQvj3rDMCfUBlXlg4fAvfS',
};

export const URL_OFFERWALL_REAL = '';

export const MIN_CLAIM_COINS = 10000;
export const DIAMOND_CLAIM_KEYS_REQUIRED = 5;
export const CAMPAIGN_KEYS_PER_10_LEVELS = 1;
export const WELCOME_BONUS_COINS = 500;

export const SPECIAL_LEVELS: Record<number, { theme: string; color: string; message: string }> = {
  4: { theme: 'love', color: '#ef4444', message: '¡4 AÑOS DE AMOR ETERNO!' },
  10: { theme: 'baby', color: '#ffffff', message: '¡GUARDIÁN DEL BEBÉ DE LA SUERTE!' },
  30: { theme: 'baby', color: '#ffffff', message: '¡GUARDIÁN DEL BEBÉ DE LA SUERTE!' },
};

export const TOTAL_CAMPAIGN_LEVELS = 999;
export const CAMPAIGN_COIN_TIERS = [
  { maxLevel: 10, min: 10, max: 30 },
  { maxLevel: 20, min: 20, max: 60 },
  { maxLevel: 50, min: 40, max: 100 },
  { maxLevel: 100, min: 60, max: 150 },
  { maxLevel: 200, min: 100, max: 200 },
  { maxLevel: 999, min: 100, max: 200 },
];

export function getCampaignCoinReward(level: number): { min: number; max: number } {
  for (const tier of CAMPAIGN_COIN_TIERS) {
    if (level <= tier.maxLevel) return { min: tier.min, max: tier.max };
  }
  return { min: 100, max: 200 };
}

export const INTERSTITIAL_COOLDOWN_SECONDS = 300;

export const COINS_PER_USD = 15000;
export const SOLES_PER_USD = 3.80;
export const COINS_PER_SOLES = COINS_PER_USD / SOLES_PER_USD;

export const INACTIVITY_THRESHOLD_DAYS = 7;
export const NEAR_CLAIM_THRESHOLD = 8000;
export const DIAMOND_CLAIM_COST_POINTS = 10;
export const INFLUENCER_MIN_RUNS = 30;
export const INFLUENCER_MIN_SCORE = 5000;
export const INFLUENCER_MIN_BALANCE = 2000;
export const INFLUENCER_MIN_WITHDRAW = 110;
export const INFLUENCER_RECENT_GAMES = 5;
export const INFLUENCER_RECENT_DAYS = 7;
export const RETURNED_USER_MIN_GAMES = 5;
export const RETURNED_USER_INACTIVE_DAYS = 15;
export const OPERATOR_LUNCH_BREAK_HOURS = 4;
export const RANKING_PAGE_SIZE = 20;
export const IMAGE_MAX_SIZE_KB = 500;

export const MAX_DAILY_EXCHANGES = 50;
export const INACTIVITY_EXPIRY_DAYS = 30;
export const RECENT_ACTIVITY_REQUIRED_DAYS = 7;
export const MAX_EXCHANGES_PER_DEVICE = 1;
