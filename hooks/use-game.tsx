'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { CHARACTERS, getCharacter, getShip, getZombieCharacter, type CharacterDef, type ShipDef, type ZombieCharDef } from '@/lib/characters';
import {
  collection, doc, setDoc, getDocs, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp,
  updateDoc, deleteDoc, where, writeBatch, getDoc, Timestamp, increment, runTransaction,
} from 'firebase/firestore';
import { db, auth, verificarYCrearUsuario } from '@/lib/firebase';
import { pauseAudio, resumeAudio, stopActionMusic, setSfxEnabled } from '@/lib/audio';
import type { CanjeRequest, CanjeGameId } from '@/lib/canjes';
import { CANJE_REWARDS, getRewardById, CORRECTION_TIMEOUT_MS, coinsToUsd } from '@/lib/canjes';
import {
  type CreatorApplication, type CreatorCode, type ReferralRecord, type CreatorStatus, type Platform,
  normalizeCode, isValidCode, isValidUrl, getMonthKey, getDayKey,
  CODE_MIN_LENGTH, CODE_MAX_LENGTH, PLAYER_REFERRAL_REWARD, CREATOR_REFERRAL_REWARD,
  QUALIFY_MIN_MINUTES, QUALIFY_MIN_DAYS,
} from '@/lib/creators';
import {
   onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  type User,
} from 'firebase/auth';
import {
  cacheGet, cacheSet, cacheInvalidatePattern, getStartOfWeek, getDaysAgo,
} from '@/lib/firebase-optimization';
import { MIN_CLAIM_COINS, DIAMOND_CLAIM_KEYS_REQUIRED, CAMPAIGN_KEYS_PER_10_LEVELS, WELCOME_BONUS_COINS, WELCOME_BONUS_KEYS, RECENT_ACTIVITY_REQUIRED_DAYS, RETURN_REWARD_COINS, RETURN_REWARD_THRESHOLD_DAYS, getCampaignKeyPrice as getConfigCampaignKeyPrice, getCampaignCoinReward } from '@/lib/config';
import { setupDailyNotifications } from '@/lib/notifications';
import { requestNotificationPermissionAndToken, registerServiceWorker } from '@/lib/push-notifications';
import {
  ADMOB_CONFIG, COINS_PER_USD, SOLES_PER_USD, INACTIVITY_THRESHOLD_DAYS,
  NEAR_CLAIM_THRESHOLD, INFLUENCER_MIN_RUNS, INFLUENCER_MIN_SCORE,
  INFLUENCER_MIN_BALANCE, INFLUENCER_MIN_WITHDRAW, INFLUENCER_RECENT_GAMES,
  INFLUENCER_RECENT_DAYS, RETURNED_USER_MIN_GAMES, RETURNED_USER_INACTIVE_DAYS,
  OPERATOR_LUNCH_BREAK_HOURS, RANKING_PAGE_SIZE, VIP_DURATION_DAYS, VIP_DISPONIBLE_PLAYSTORE,
} from '@/lib/config';

async function getDocsCount(q: ReturnType<typeof query>): Promise<number> {
  const snap = await getDocs(q);
  return snap.size;
}

export type Screen =
  | 'intro'
  | 'login'
  | 'menu'
  | 'mode-select'
  | 'campaign'
  | 'space-game'
  | 'zombie-game'
  | 'survival'
  | 'shop'
  | 'roulette'
  | 'characters'
  | 'ranking'
  | 'offerwall'
  | 'admin'
  | 'operator'
  | 'influencer'
  | 'canjes'
  | 'arcade'
  | 'neon-maze'
  | 'garrfly'
  | 'zrunner'
  | 'garrblade'
  | 'creator';

export interface UpgradeState {
  fireRate: number;
  damage: number;
  coinMagnet: number;
  superShield: number;
}

export interface CampaignProgress {
  currentLevel: number;
  stars: Record<number, number>;
  keys: number;
  diamondsClaimed: boolean;
  lastLevelCompletedAt: number | null;
}

export interface TowerLevel {
  turret: number;
  drone: number;
  medic: number;
  neonShield?: number;
}

export interface RankEntry {
  name: string;
  score: number;
  uid?: string;
  avatar?: string;
  level?: number;
}

export type ControlSize = 'small' | 'medium' | 'large';
export type OrientationMode = 'auto' | 'portrait' | 'landscape';
export type UITheme = 'tactical-dark' | 'cyan-neon' | 'blood-red' | 'military-green';

export const UI_THEMES: Array<{ id: UITheme; name: string; primary: string; accent: string; bg: string }> = [
  { id: 'tactical-dark', name: 'Tactico Oscuro', primary: '#8a9b50', accent: '#d4d8b8', bg: '#0d0f0a' },
  { id: 'cyan-neon', name: 'Cian Neon', primary: '#22d3ee', accent: '#67e8f9', bg: '#04141a' },
  { id: 'blood-red', name: 'Rojo Sangre', primary: '#ef4444', accent: '#fca5a5', bg: '#1a0404' },
  { id: 'military-green', name: 'Verde Militar', primary: '#4d7c0f', accent: '#84cc16', bg: '#0a1004' },
];

export interface OfferwallConfig {
  active: boolean;
  link: string;
  rewardPerDownload: number;
  dailyLimit: number;
}

export interface PendingRequest {
  id: string;
  userId: string;
  playerID: string;
  nickname: string;
  tiempoJugado: number;
  puntosGastados: number;
  fecha: any;
  estado: string;
}

export interface AdminUserInfo {
  uid: string;
  nombre: string;
  email: string;
  coins: number;
  lastLogin: string;
  inactive: boolean;
  totalRuns?: number;
  bestScore?: number;
  rol?: string;
  puntos?: number;
  puntos_semanales?: number;
  puntos_espacio?: number;
  puntos_zombies?: number;
  tiempo_jugado_min?: number;
  vip?: boolean;
  diamondHistory?: number;
  createdAt?: any;
  adsWatched?: number;
  bitlabsEarnings?: number;
  campaignKeys?: number;
}

export interface NearClaimSummary {
  totalEstimatedCost: number;
  totalEstimatedRevenue: number;
  totalNet: number;
  count: number;
}

export interface InfluencerInfo {
  uid: string;
  nombre: string;
  email: string;
  coins: number;
  totalRuns: number;
  bestScore: number;
  rank: 'bronce' | 'plata' | 'oro';
  canWithdraw: boolean;
  recentGames: number;
}

export interface OperatorTurn {
  id: string;
  operatorId: string;
  operatorName: string;
  startTime: any;
  endTime?: any;
  initialBalance: number;
  currentBalance: number;
  prizesPaid: number;
  status: 'activo' | 'cerrado' | 'almuerzo';
  receiptUrl?: string;
  checkoutUrl?: string;
}

export interface OperatorLogEntry {
  id: string;
  operatorUid: string;
  operatorName: string;
  action: string;
  details: string;
  timestamp: number;
}

export type TransactionLight = 'green' | 'yellow' | 'red';

export interface AdminStats {
  totalUsers: number;
  totalCoins: number;
  activeCoins: number;
  inactiveCoins: number;
  reservedAmount: number;
  availableAmount: number;
  nearClaimUsers: AdminUserInfo[];
  activeUsers: number;
  inactiveUsers: number;
  activeUsers1h: number;
  activeUsers24h: number;
  activeUsers30d: number;
  returnedUsers: AdminUserInfo[];
  nearClaimSummary: NearClaimSummary;
  totalExchanges: number;
}

export interface CampaignLevelStat {
  level: number;
  activePlayers: number;
}

export interface IncomeRecord {
  id: string;
  amountPEN: number;
  note: string;
  date: string;
}

interface GameState {
  screen: Screen;
  coins: number;
  points: number;
  lives: number;
  vip: boolean;
  muted: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  customColor: string;
  user: User | null;
  selectedCharacter: string;
  selectedShip: string;
  selectedZombie: string;
  loggedIn: boolean;
  email: string;
  playerName: string;
  topPlayerName: string;
  topPlayerScore: number;
  topPlayerAvatar?: string;
  absoluteRecord: number;
  lastRouletteDate: string;
  rouletteSpinsToday: number;
  suggestions: Array<{ id: number; text: string; date: string }>;
  upgrades: UpgradeState;
  campaignProgress: CampaignProgress;
  towerLevels: TowerLevel;
  survivalBestTime: number;
  spaceRanking: RankEntry[];
  zombieRanking: RankEntry[];
  weeklyRanking: RankEntry[];
  survivalRanking: RankEntry[];
  isOnline: boolean;
  pendingCoins: number;
  bloodEnabled: boolean;
  controlSize: ControlSize;
  orientationMode: OrientationMode;
  uiTheme: UITheme;
  setUITheme: (t: UITheme) => void;
  setCustomColorState: (c: string) => void;
  lastInterstitialTime: number;
  setScreen: (s: Screen) => void;
  addCoins: (n: number) => void;
  spendCoins: (n: number) => boolean;
  addPoints: (n: number) => void;
  spendPoints: (n: number) => boolean;
  setLives: (n: number) => void;
  buyVIP: () => void;
  vipAvailable: boolean;
  vipExpiry: string | null;
  toggleMute: () => void;
  toggleMusic: () => void;
  toggleSfx: () => void;
  toggleBlood: () => void;
  setControlSize: (s: ControlSize) => void;
  setOrientationMode: (m: OrientationMode) => void;
  selectCharacter: (id: string) => void;
  selectShip: (id: string) => void;
  selectZombie: (id: string) => void;
  setLoggedIn: (v: boolean, email?: string) => void;
  recordRouletteSpin: () => void;
  getFreeSpinsRemaining: () => number;
  addSuggestion: (text: string) => void;
  getCharacter: () => CharacterDef;
  getShip: () => ShipDef;
  getZombieCharacter: () => ZombieCharDef;
  buyUpgrade: (key: keyof UpgradeState, cost: number) => boolean;
  completeLevel: (level: number, stars: number, coinsEarned: number) => void;
  getCurrentCampaignLevel: () => number;
  exchangeDiamonds: (playerID: string, nickname: string) => Promise<{ ok: boolean; error?: string }>;
  buyTower: (tower: keyof TowerLevel, cost: number) => boolean;
  getTowerLevel: (tower: keyof TowerLevel) => number;
  submitSurvivalScore: (timeMs: number) => Promise<void>;
  canExchangeDiamonds: () => { ok: boolean; reason?: string };
  buyCampaignKey: () => { ok: boolean; error?: string };
  getCampaignKeyPrice: () => number;
  refreshRanking: () => Promise<void>;
  refreshWeeklyRanking: () => Promise<void>;
  loadMoreRanking: (type: 'space' | 'zombie' | 'weekly') => Promise<void>;
  hasMoreRanking: (type: 'space' | 'zombie' | 'weekly') => boolean;
  submitSpaceScore: (score: number) => Promise<void>;
  submitZombieScore: (score: number) => Promise<void>;
  canShowInterstitial: () => boolean;
  recordInterstitial: () => void;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ ok: boolean; error?: string }>;
  logOut: () => Promise<void>;
  claimDiamonds: (playerID: string, nickname: string) => Promise<{ ok: boolean; error?: string }>;
  sendSuggestion: (text: string) => Promise<{ ok: boolean; error?: string }>;
  offerwallConfig: OfferwallConfig | null;
  refreshOfferwallConfig: () => Promise<void>;
  offerwallDownloadsToday: number;
  recordOfferwallDownload: () => Promise<{ ok: boolean; error?: string }>;
  userRole: 'user' | 'operador' | 'admin';
  pendingRequests: PendingRequest[];
  refreshPendingRequests: () => Promise<void>;
  confirmPendingRequest: (requestId: string) => Promise<{ ok: boolean; error?: string }>;
  rejectPendingRequest: (requestId: string) => Promise<{ ok: boolean; error?: string }>;
  canjes: CanjeRequest[];
  refreshCanjes: () => Promise<void>;
  submitCanje: (rewardId: string, gameId: CanjeGameId, playerID: string, nickname: string) => Promise<{ ok: boolean; error?: string }>;
  correctCanjeId: (canjeId: string, newPlayerID: string) => Promise<{ ok: boolean; error?: string }>;
  cancelCanje: (canjeId: string) => Promise<{ ok: boolean; error?: string }>;
  adminApproveCanje: (canjeId: string) => Promise<{ ok: boolean; error?: string }>;
  adminMarkCorrection: (canjeId: string) => Promise<{ ok: boolean; error?: string }>;
  adminRejectCanje: (canjeId: string, reason: string) => Promise<{ ok: boolean; error?: string }>;
  approvedCanjes: CanjeRequest[];
  canjesPagination: { page: number; totalPages: number; total: number; approved: number; pending: number; rejected: number; };
  setCanjesPage: (page: number) => void;
  adminCanjesList: CanjeRequest[];
  adminApprovedList: CanjeRequest[];
  refreshAdminCanjes: () => Promise<void>;
  adminCanjesPage: number;
  setAdminCanjesPage: (page: number) => void;
  adminUserStats: AdminStats;
  refreshAdminStats: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  userSearchResults: AdminUserInfo[];
  loadMoreUsers: () => Promise<void>;
  hasMoreUsers: boolean;
  clearUserSearch: () => void;
  isDeviceBanned: boolean;
  checkDeviceBan: () => Promise<void>;
  reportSuspiciousActivity: (type: string, details: string) => void;
  delegateWork: boolean;
  setDelegateWork: (v: boolean) => Promise<void>;
  operatorTurn: OperatorTurn | null;
  startOperatorTurn: (initialBalance: number, receiptFile?: Blob) => Promise<{ ok: boolean; error?: string }>;
  endOperatorTurn: (checkoutFile?: Blob) => Promise<{ ok: boolean; error?: string }>;
  operatorOnLunch: boolean;
  influencerInfo: InfluencerInfo | null;
  refreshInfluencerInfo: () => Promise<void>;
  requestInfluencerWithdraw: (amount: number) => Promise<{ ok: boolean; error?: string }>;
  adminManualIncome: (params: { amount: number; date: string; note?: string }) => Promise<{ ok: boolean; error?: string }>;
  adminDeleteIncome: (id: string) => Promise<{ ok: boolean; error?: string }>;
  adminIncomeRecords: IncomeRecord[];
  refreshAdminIncomeRecords: (year: number, month: number) => Promise<void>;
  adminSetExchangeLimit: (limit: number) => Promise<{ ok: boolean; error?: string }>;
  adminBanUser: (uid: string) => Promise<{ ok: boolean; error?: string }>;
  adminPanicButton: () => Promise<{ ok: boolean; error?: string }>;
  transactionLight: TransactionLight;
  currentUserRank: number | null;
  currentUserScore: number;
  allUsersList: Array<{
    uid: string; nombre: string; email: string; coins: number;
    puntos: number; vip: boolean; playerID: string; nickname: string;
    tiempo_jugado_min: number; tiempo_app_min: number; createdAt: unknown;
    lastActive: unknown; banned: boolean; currentRequest: string;
  }>;
  observerMode: boolean;
  toggleObserverMode: () => void;
  addPlayTime: (ms: number) => void;
  flushPlayTime: () => void;
  startGameBatch: () => void;
  endGameBatch: () => void;
  showWelcomeBonus: boolean;
  dismissWelcomeBonus: () => void;
  showReturnReward: boolean;
  dismissReturnReward: () => void;
  exchangeNotification: string | null;
  dismissExchangeNotification: () => void;
  campaignLevelStats: CampaignLevelStat[];
  refreshCampaignLevelStats: () => Promise<void>;
  addCampaignKeyFromAd: () => void;
  logOperatorAction: (action: string, details?: string) => Promise<void>;
  operatorLogs: OperatorLogEntry[];
  refreshOperatorLogs: () => Promise<void>;
  // Creator Program
  creatorApplication: CreatorApplication | null;
  creatorCode: CreatorCode | null;
  creatorReferralCode: string | null;
  submitCreatorApplication: (channelName: string, platform: Platform, profileUrl: string, videoUrl: string, requestedCode: string) => Promise<{ ok: boolean; error?: string }>;
  refreshCreatorApplication: () => Promise<void>;
  applyReferralCode: (code: string) => Promise<{ ok: boolean; error?: string }>;
  refreshCreatorReferralCode: () => Promise<void>;
  creatorStats: { total: number; pending: number; qualified: number; coinsEarned: number } | null;
  refreshCreatorStats: () => Promise<void>;
  creatorRanking: Array<{ code: string; channelName: string; qualified: number; platform: Platform }>;
  refreshCreatorRanking: () => Promise<void>;
  adminCreatorApplications: CreatorApplication[];
  adminCreatorCodes: CreatorCode[];
  refreshAdminCreators: () => Promise<void>;
  adminApproveCreator: (appId: string) => Promise<{ ok: boolean; error?: string }>;
  adminRejectCreator: (appId: string, reason: string) => Promise<{ ok: boolean; error?: string }>;
  adminSuspendCreator: (code: string) => Promise<{ ok: boolean; error?: string }>;
  adminReactivateCreator: (code: string) => Promise<{ ok: boolean; error?: string }>;
}

export interface SignUpData {
  fullName: string;
  age: number;
  country: string;
  email: string;
  password: string;
}

const GameContext = createContext<GameState | null>(null);

export function useGame(): GameState {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

const STORAGE_KEY = 'garrdashpe3d_save';

interface SaveData {
  coins: number;
  points: number;
  vip: boolean;
  vipExpiry?: string | null;
  muted: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  customColor: string;
  selectedCharacter: string;
  selectedShip: string;
  selectedZombie: string;
  loggedIn: boolean;
  email: string;
  playerName: string;
  lastRouletteDate: string;
  rouletteSpinsToday: number;
  suggestions: Array<{ id: number; text: string; date: string }>;
  upgrades: UpgradeState;
  bloodEnabled: boolean;
  controlSize: ControlSize;
  orientationMode: OrientationMode;
  uiTheme?: UITheme;
  campaignProgress?: CampaignProgress;
  towerLevels?: TowerLevel;
  survivalBestTime?: number;
}

function loadSave(): Partial<SaveData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveData(data: Partial<SaveData>) {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadSave();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch {}
}

export const UPGRADE_COSTS: Record<keyof UpgradeState, number> = {
  fireRate: 500,
  damage: 800,
  coinMagnet: 600,
  superShield: 1000,
};

const EMPTY_RANKING: RankEntry[] = [];

const INTERSTITIAL_COOLDOWN_MS = 5 * 60 * 1000;

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreenState] = useState<Screen>('intro');
  const [coins, setCoins] = useState(0);
  const [points, setPoints] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lives, setLivesState] = useState(3);
  const [vip, setVip] = useState(false);
  const [muted, setMuted] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [customColor, setCustomColor] = useState('#8a9b50');
  const [selectedCharacter, setSelectedCharacter] = useState('alpha');
  const [selectedShip, setSelectedShip] = useState('alpha');
  const [selectedZombie, setSelectedZombie] = useState('soldier');
  const [loggedIn, setLoggedInState] = useState(false);
  const [email, setEmail] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [topPlayerName, setTopPlayerName] = useState('Carlos');
  const [topPlayerScore, setTopPlayerScore] = useState(0);
  const [topPlayerAvatar, setTopPlayerAvatar] = useState<string | undefined>(undefined);
  const [absoluteRecord, setAbsoluteRecord] = useState(154820);
  const [lastRouletteDate, setLastRouletteDate] = useState('');
  const [rouletteSpinsToday, setRouletteSpinsToday] = useState(0);
  const [suggestions, setSuggestions] = useState<Array<{ id: number; text: string; date: string }>>([]);
  const [upgrades, setUpgrades] = useState<UpgradeState>({ fireRate: 0, damage: 0, coinMagnet: 0, superShield: 0 });
  const [campaignProgress, setCampaignProgress] = useState<CampaignProgress>({ currentLevel: 1, stars: {}, keys: 0, diamondsClaimed: false, lastLevelCompletedAt: null });
  const [towerLevels, setTowerLevels] = useState<TowerLevel>({ turret: 0, drone: 0, medic: 0, neonShield: 0 });
  const [survivalBestTime, setSurvivalBestTime] = useState(0);
  const [survivalRanking, setSurvivalRanking] = useState<RankEntry[]>(EMPTY_RANKING);
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [showReturnReward, setShowReturnReward] = useState(false);
  const [exchangeNotification, setExchangeNotification] = useState<string | null>(null);
  const [campaignLevelStats, setCampaignLevelStats] = useState<CampaignLevelStat[]>([]);
  const [spaceRanking, setSpaceRanking] = useState<RankEntry[]>(EMPTY_RANKING);
  const [zombieRanking, setZombieRanking] = useState<RankEntry[]>(EMPTY_RANKING);
  const [weeklyRanking, setWeeklyRanking] = useState<RankEntry[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCoins, setPendingCoins] = useState(0);
  const [bloodEnabled, setBloodEnabled] = useState(true);
  const [controlSize, setControlSizeState] = useState<ControlSize>('medium');
  const [orientationMode, setOrientationModeState] = useState<OrientationMode>('portrait');
  const [uiTheme, setUIThemeState] = useState<UITheme>('tactical-dark');
  const [authReady, setAuthReady] = useState(false);
  const [offerwallConfig, setOfferwallConfig] = useState<OfferwallConfig | null>(null);
  const [offerwallDownloadsToday, setOfferwallDownloadsToday] = useState(0);
  const [userRole, setUserRole] = useState<'user' | 'operador' | 'admin'>('user');
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [canjes, setCanjes] = useState<CanjeRequest[]>([]);
  const [approvedCanjes, setApprovedCanjes] = useState<CanjeRequest[]>([]);
  const [canjesPage, setCanjesPage] = useState(0);
  const [canjesTotalCounts, setCanjesTotalCounts] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const canjesPageSize = 100;
  const [adminUserStats, setAdminUserStats] = useState<AdminStats>({
    totalUsers: 0, totalCoins: 0, activeCoins: 0, inactiveCoins: 0,
    reservedAmount: 0, availableAmount: 0, nearClaimUsers: [], activeUsers: 0, inactiveUsers: 0,
    activeUsers1h: 0, activeUsers24h: 0, activeUsers30d: 0,
    returnedUsers: [], nearClaimSummary: { totalEstimatedCost: 0, totalEstimatedRevenue: 0, totalNet: 0, count: 0 },
    totalExchanges: 0,
  });
  const [userSearchResults, setUserSearchResults] = useState<AdminUserInfo[]>([]);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const userSearchCursorRef = useRef<number>(0);
  const userSearchQueryRef = useRef<string>('');
  const [isDeviceBanned, setIsDeviceBanned] = useState(false);
  const [delegateWork, setDelegateWorkState] = useState(false);
  const [operatorTurn, setOperatorTurn] = useState<OperatorTurn | null>(null);
  const [operatorOnLunch, setOperatorOnLunch] = useState(false);
  const [influencerInfo, setInfluencerInfo] = useState<InfluencerInfo | null>(null);
  const [transactionLight, setTransactionLight] = useState<TransactionLight>('green');
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUserScore, setCurrentUserScore] = useState<number>(0);
  const [allUsersList, setAllUsersList] = useState<Array<{
    uid: string; nombre: string; email: string; coins: number;
    puntos: number; vip: boolean; playerID: string; nickname: string;
    tiempo_jugado_min: number; tiempo_app_min: number; createdAt: unknown;
    lastActive: unknown; banned: boolean; currentRequest: string;
  }>>([]);
  const [vipExpiry, setVipExpiry] = useState<string | null>(null);
  const [observerMode, setObserverMode] = useState(false);
  const [operatorLogs, setOperatorLogs] = useState<OperatorLogEntry[]>([]);
  // Creator Program state
  const [creatorApplication, setCreatorApplication] = useState<CreatorApplication | null>(null);
  const [creatorCode, setCreatorCode] = useState<CreatorCode | null>(null);
  const [creatorReferralCode, setCreatorReferralCode] = useState<string | null>(null);
  const [creatorStats, setCreatorStats] = useState<{ total: number; pending: number; qualified: number; coinsEarned: number } | null>(null);
  const [creatorRanking, setCreatorRanking] = useState<Array<{ code: string; channelName: string; qualified: number; platform: Platform }>>([]);
  const [adminCreatorApplications, setAdminCreatorApplications] = useState<CreatorApplication[]>([]);
  const [adminCreatorCodes, setAdminCreatorCodes] = useState<CreatorCode[]>([]);

  const lastInterstitialTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scoreRef = useRef(0);
  const rankingPaginationRef = useRef<{ space: number; zombie: number; weekly: number }>({ space: RANKING_PAGE_SIZE, zombie: RANKING_PAGE_SIZE, weekly: RANKING_PAGE_SIZE });
  const hasMoreRankingRef = useRef<{ space: boolean; zombie: boolean; weekly: boolean }>({ space: true, zombie: true, weekly: true });

  useEffect(() => {
    const s = loadSave();
    if (s.coins !== undefined) setCoins(s.coins);
    if (s.points !== undefined) setPoints(s.points);
    if (s.vip !== undefined) setVip(s.vip);
    if (s.vipExpiry !== undefined) setVipExpiry(s.vipExpiry);
    if (s.muted !== undefined) setMuted(s.muted);
    if (s.musicEnabled !== undefined) setMusicEnabled(s.musicEnabled);
    if (s.sfxEnabled !== undefined) setSfxEnabled(s.sfxEnabled);
    if (s.customColor !== undefined) setCustomColor(s.customColor);
    if (s.selectedCharacter !== undefined) setSelectedCharacter(s.selectedCharacter);
    if (s.selectedShip !== undefined) setSelectedShip(s.selectedShip);
    if (s.selectedZombie !== undefined) setSelectedZombie(s.selectedZombie);
    if (s.loggedIn !== undefined) setLoggedInState(s.loggedIn);
    if (s.email !== undefined) setEmail(s.email);
    if (s.playerName !== undefined) setPlayerName(s.playerName);
    if (s.lastRouletteDate !== undefined) setLastRouletteDate(s.lastRouletteDate);
    if (s.rouletteSpinsToday !== undefined) setRouletteSpinsToday(s.rouletteSpinsToday);
    if (s.suggestions !== undefined) setSuggestions(s.suggestions);
    if (s.upgrades !== undefined) setUpgrades(s.upgrades);
    if (s.campaignProgress !== undefined) setCampaignProgress(s.campaignProgress);
    if (s.towerLevels !== undefined) setTowerLevels(s.towerLevels);
    if (s.survivalBestTime !== undefined) setSurvivalBestTime(s.survivalBestTime);
    if (s.bloodEnabled !== undefined) setBloodEnabled(s.bloodEnabled);
    if (s.controlSize !== undefined) setControlSizeState(s.controlSize);
    if (s.orientationMode !== undefined) setOrientationModeState(s.orientationMode);
    if (s.uiTheme !== undefined) setUIThemeState(s.uiTheme);
  }, []);

  const userDocUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      setCurrentUser(user);
      if (userDocUnsubRef.current) {
        userDocUnsubRef.current();
        userDocUnsubRef.current = null;
      }
      if (user) {
        await verificarYCrearUsuario(user);
        setLoggedInState(true);
        setEmail(user.email ?? '');
        registerServiceWorker().then(() => requestNotificationPermissionAndToken(user.uid));
        let role: 'user' | 'operador' | 'admin' = 'user';
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.rol === 'admin') role = 'admin';
            else if (data.rol === 'operador') role = 'operador';
            if (data.lastLogin) {
              const lastLoginDate = data.lastLogin instanceof Timestamp ? data.lastLogin.toDate() : new Date(data.lastLogin);
              const daysSince = Math.floor((Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
              if (daysSince >= RETURN_REWARD_THRESHOLD_DAYS && !data.returnRewardClaimed) {
                try {
                  await updateDoc(doc(db, 'usuarios', user.uid), { coins: increment(RETURN_REWARD_COINS), returnRewardClaimed: true, lastLogin: serverTimestamp() });
                  setShowReturnReward(true);
                } catch {}
              } else {
                await updateDoc(doc(db, 'usuarios', user.uid), { lastLogin: serverTimestamp() });
              }
            }
          } else {
            await setDoc(doc(db, 'usuarios', user.uid), {
              nombre: user.email?.split('@')[0] ?? 'Player',
              email: user.email ?? '',
              coins: WELCOME_BONUS_COINS,
              totalRuns: 0,
              bestScore: 0,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              rol: 'user',
              welcomeBonusClaimed: true,
              campaignLevel: 1,
              campaignKeys: WELCOME_BONUS_KEYS,
              campaignStars: {},
              towerLevels: { turret: 0, drone: 0, medic: 0 },
            });
            setShowWelcomeBonus(true);
          }
        } catch {}
        setUserRole(role);
        if (role === 'admin') setScreenState('admin');
        else if (role === 'operador') setScreenState('operator');
        else setScreenState('menu');

        setupDailyNotifications();

        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.coins !== undefined) setCoins(data.coins);
            if (data.puntos !== undefined) setPoints(data.puntos);
            if (data.vip !== undefined) setVip(data.vip);
            if (data.vipExpiry) {
              const expiryDate = data.vipExpiry instanceof Timestamp ? data.vipExpiry.toDate().toISOString() : String(data.vipExpiry);
              setVipExpiry(expiryDate);
            }
            const name = data.nombre || data.email?.split('@')[0] || 'Player';
            setPlayerName(name);
            if (data.campaignLevel !== undefined) {
              setCampaignProgress(prev => ({ ...prev, currentLevel: data.campaignLevel ?? prev.currentLevel, keys: data.campaignKeys ?? prev.keys, diamondsClaimed: data.diamondsClaimed ?? false }));
            }
            if (data.towerLevels !== undefined) setTowerLevels(data.towerLevels);
            if (data.survivalBestTime !== undefined) setSurvivalBestTime(data.survivalBestTime);
            if (data.welcomeBonusClaimed !== true) {
              try {
                await updateDoc(doc(db, 'usuarios', user.uid), { coins: increment(WELCOME_BONUS_COINS), welcomeBonusClaimed: true });
                setShowWelcomeBonus(true);
              } catch {}
            }
            saveData({
              coins: data.coins ?? 0, points: data.puntos ?? 0, vip: data.vip ?? false,
              playerName: name, email: data.email ?? user.email ?? '',
              vipExpiry: data.vipExpiry instanceof Timestamp ? data.vipExpiry.toDate().toISOString() : null,
            });
          }
        } catch {}
      } else {
        setCurrentUser(null);
        setLoggedInState(false);
        setUserRole('user');
        setCoins(0);
        setPoints(0);
        setPlayerName('');
        saveData({ loggedIn: false });
      }
      setAuthReady(true);
    });
    return () => {
      unsub();
      if (userDocUnsubRef.current) userDocUnsubRef.current();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    const update = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online && pendingCoins > 0) {
        setCoins((prev) => {
          const next = prev + pendingCoins;
          saveData({ coins: next });
          return next;
        });
        setPendingCoins(0);
      }
    };
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, [pendingCoins]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = cacheGet<{ name: string; score: number; avatar?: string }>('top1');
        if (cached && cached.score > 0 && !cancelled) {
          setTopPlayerName(cached.name);
          setTopPlayerScore(cached.score);
          setAbsoluteRecord(cached.score);
          if (cached.avatar) setTopPlayerAvatar(cached.avatar);
        }
        const topRef = doc(db, 'global', 'top1');
        const snap = await getDoc(topRef);
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data();
          const name = data.name || data.nickname || 'Carlos';
          const score = data.score || 0;
          const avatar = data.avatar;
          if (score > 0) {
            setTopPlayerName(name);
            setTopPlayerScore(score);
            setAbsoluteRecord(score);
            if (avatar) setTopPlayerAvatar(avatar);
            cacheSet('top1', { name, score, avatar }, 5 * 60 * 1000);
          }
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = cacheGet<{ name: string; score: number; avatar?: string }>('topBestScore');
        if (cached && cached.score > 0 && !cancelled) {
          setTopPlayerName(cached.name);
          setTopPlayerScore(cached.score);
          setAbsoluteRecord(cached.score);
          if (cached.avatar) setTopPlayerAvatar(cached.avatar);
        }
        const topQ = query(collection(db, 'usuarios'), orderBy('bestScore', 'desc'), limit(1));
        const snap = await getDocs(topQ);
        if (cancelled) return;
        if (!snap.empty) {
          const data = snap.docs[0].data();
          const name = data.nombre || data.email?.split('@')[0] || 'Jugador';
          const score = data.bestScore ?? 0;
          if (score > 0) {
            setTopPlayerName(name);
            setTopPlayerScore(score);
            setAbsoluteRecord(score);
            if (data.avatar) setTopPlayerAvatar(data.avatar);
            cacheSet('topBestScore', { name, score, avatar: data.avatar }, 5 * 60 * 1000);
          }
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const spaceTop = spaceRanking[0];
    const zombieTop = zombieRanking[0];
    const candidates: RankEntry[] = [];
    if (spaceTop) candidates.push(spaceTop);
    if (zombieTop) candidates.push(zombieTop);
    if (candidates.length > 0) {
      const best = candidates.reduce((a, b) => (b.score > a.score ? b : a));
      setTopPlayerName(best.name);
      setTopPlayerScore(best.score);
      if (best.score > absoluteRecord) {
        setAbsoluteRecord(best.score);
      }
    }
  }, [spaceRanking, zombieRanking, absoluteRecord]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (audioRef.current) return;
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3');
    audio.loop = true;
    audio.volume = 0.2;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (muted || !musicEnabled || screen === 'intro' || screen === 'login') {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  }, [muted, musicEnabled, screen]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (audioRef.current) audioRef.current.pause();
        pauseAudio();
        (window as unknown as { isAudioPausedBySystem?: boolean }).isAudioPausedBySystem = true;
      } else {
        (window as unknown as { isAudioPausedBySystem?: boolean }).isAudioPausedBySystem = false;
        if (audioRef.current && !muted && musicEnabled && screen !== 'intro' && screen !== 'login') {
          audioRef.current.play().catch(() => {});
        }
        resumeAudio();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [muted, musicEnabled, screen]);

  const setScreen = useCallback((s: Screen) => setScreenState(s), []);

  const gameBatchModeRef = useRef(false);
  const pendingGameCoinsRef = useRef(0);
  const pendingGamePointsRef = useRef(0);

  const startGameBatch = useCallback(() => {
    gameBatchModeRef.current = true;
    pendingGameCoinsRef.current = 0;
    pendingGamePointsRef.current = 0;
  }, []);

  const endGameBatch = useCallback(() => {
    gameBatchModeRef.current = false;
    const user = auth.currentUser;
    let coinsToSync = pendingGameCoinsRef.current;
    if (vip && coinsToSync > 0) coinsToSync = Math.floor(coinsToSync * 1.5);
    if (user && isOnline) {
      const updates: Record<string, ReturnType<typeof increment>> = {};
      if (coinsToSync !== 0) updates.coins = increment(coinsToSync);
      if (pendingGamePointsRef.current !== 0) updates.puntos = increment(pendingGamePointsRef.current);
      if (Object.keys(updates).length > 0) {
        try { updateDoc(doc(db, 'usuarios', user.uid), updates); } catch {}
      }
    } else if (!isOnline) {
      if (coinsToSync > 0) setPendingCoins((prev) => prev + coinsToSync);
    }
    pendingGameCoinsRef.current = 0;
    pendingGamePointsRef.current = 0;
  }, [isOnline, vip]);

  const addCoins = useCallback((n: number) => {
    if (typeof n !== 'number' || !isFinite(n) || n <= 0 || n > 100000) return;
    const user = auth.currentUser;
    if (!user || !isOnline) {
      if (!isOnline) { setPendingCoins((prev) => Math.min(prev + n, 1000000)); return; }
      setCoins((prev) => { const next = prev + n; saveData({ coins: next }); return next; });
      return;
    }
    setCoins((prev) => prev + n);
    if (gameBatchModeRef.current) {
      pendingGameCoinsRef.current += n;
      return;
    }
    try { updateDoc(doc(db, 'usuarios', user.uid), { coins: increment(n) }); } catch {}
  }, [isOnline]);

  const spendCoins = useCallback((n: number): boolean => {
    if (typeof n !== 'number' || !isFinite(n) || n <= 0) return false;
    if (n > 1000000) return false;
    const user = auth.currentUser;
    if (!user || !isOnline) {
      let ok = false;
      setCoins((prev) => {
        if (prev >= n) { ok = true; const next = prev - n; saveData({ coins: next }); return next; }
        return prev;
      });
      return ok;
    }
    if (coins < n) return false;
    setCoins((prev) => prev - n);
    try { updateDoc(doc(db, 'usuarios', user.uid), { coins: increment(-n) }); } catch {}
    return true;
  }, [isOnline, coins]);

  const addPoints = useCallback((n: number) => {
    if (typeof n !== 'number' || !isFinite(n) || n <= 0 || n > 10000000) return;
    const user = auth.currentUser;
    if (!user || !isOnline) {
      setPoints((prev) => { const next = prev + n; saveData({ points: next }); return next; });
      return;
    }
    setPoints((prev) => prev + n);
    if (gameBatchModeRef.current) {
      pendingGamePointsRef.current += n;
      return;
    }
    try { updateDoc(doc(db, 'usuarios', user.uid), { puntos: increment(n) }); } catch {}
  }, [isOnline]);

  const spendPoints = useCallback((n: number): boolean => {
    if (typeof n !== 'number' || !isFinite(n) || n <= 0) return false;
    const user = auth.currentUser;
    if (!user || !isOnline) {
      let ok = false;
      setPoints((prev) => {
        if (prev >= n) { ok = true; const next = prev - n; saveData({ points: next }); return next; }
        return prev;
      });
      return ok;
    }
    if (points < n) return false;
    setPoints((prev) => prev - n);
    try { updateDoc(doc(db, 'usuarios', user.uid), { puntos: increment(-n) }); } catch {}
    return true;
  }, [isOnline, points]);

  const setLives = useCallback((n: number) => setLivesState(n), []);

  const buyVIP = useCallback(() => {
    if (!VIP_DISPONIBLE_PLAYSTORE) return;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + VIP_DURATION_DAYS);
    const expiryIso = expiryDate.toISOString();
    setVip(true);
    setVipExpiry(expiryIso);
    saveData({ vip: true, vipExpiry: expiryIso });
    const user = auth.currentUser;
    if (user) {
      try {
        updateDoc(doc(db, 'usuarios', user.uid), {
          vip: true,
          vipExpiry: Timestamp.fromDate(expiryDate),
        }).catch(() => {});
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!vipExpiry) return;
    const expiry = new Date(vipExpiry);
    if (new Date() > expiry) {
      setVip(false);
      setVipExpiry(null);
      saveData({ vip: false, vipExpiry: null });
      const user = auth.currentUser;
      if (user) {
        try {
          updateDoc(doc(db, 'usuarios', user.uid), {
            vip: false,
            vipExpiry: null,
          }).catch(() => {});
        } catch {}
      }
    }
  }, [vipExpiry]);

  const toggleObserverMode = useCallback(() => {
    setObserverMode((prev) => !prev);
  }, []);

  const playTimeBufferRef = useRef<number>(0);
  const playTimeSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkAndQualifyRefRef = useRef<(() => Promise<void>) | null>(null);

  const addPlayTime = useCallback((ms: number) => {
    playTimeBufferRef.current += ms;
    if (playTimeSyncTimerRef.current) clearTimeout(playTimeSyncTimerRef.current);
    playTimeSyncTimerRef.current = setTimeout(async () => {
      const user = auth.currentUser;
      if (!user || !navigator.onLine) return;
      const addMs = playTimeBufferRef.current;
      if (addMs <= 0) return;
      playTimeBufferRef.current = 0;
      try {
        const userDocRef = doc(db, 'usuarios', user.uid);
        await updateDoc(userDocRef, { tiempo_jugado_min: increment(addMs / 60000) });
      } catch {}
    }, 120000);
  }, []);

  const flushPlayTime = useCallback(() => {
    if (playTimeSyncTimerRef.current) clearTimeout(playTimeSyncTimerRef.current);
    const user = auth.currentUser;
    if (!user || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    const addMs = playTimeBufferRef.current;
    if (addMs <= 0) return;
    playTimeBufferRef.current = 0;
    try {
      const userDocRef = doc(db, 'usuarios', user.uid);
      updateDoc(userDocRef, { tiempo_jugado_min: increment(addMs / 60000) }).catch(() => {});
      // Check creator referral qualification after play time flush
      if (checkAndQualifyRefRef.current) checkAndQualifyRefRef.current();
    } catch {}
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      saveData({ muted: next });
      if (audioRef.current) {
        if (next) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(() => {});
        }
      }
      return next;
    });
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicEnabled((prev) => {
      const next = !prev;
      saveData({ musicEnabled: next });
      if (audioRef.current) {
        if (!next || muted) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(() => {});
        }
      }
      if (!next) stopActionMusic();
      return next;
    });
  }, [muted]);

  const toggleSfx = useCallback(() => {
    setSfxEnabled((prev) => {
      const next = !prev;
      saveData({ sfxEnabled: next });
      return next;
    });
  }, []);

  useEffect(() => {
    setSfxEnabled(sfxEnabled);
  }, [sfxEnabled]);

  const toggleBlood = useCallback(() => {
    setBloodEnabled((prev) => {
      const next = !prev;
      saveData({ bloodEnabled: next });
      return next;
    });
  }, []);

  const setControlSize = useCallback((s: ControlSize) => {
    setControlSizeState(s);
    saveData({ controlSize: s });
  }, []);

  const setOrientationMode = useCallback((m: OrientationMode) => {
    setOrientationModeState(m);
    saveData({ orientationMode: m });
  }, []);

  const setUITheme = useCallback((t: UITheme) => {
    setUIThemeState(t);
    saveData({ uiTheme: t });
  }, []);

  const setCustomColorState = useCallback((c: string) => {
    setCustomColor(c);
    saveData({ customColor: c });
  }, []);

  useEffect(() => {
    const theme = UI_THEMES.find((t) => t.id === uiTheme) ?? UI_THEMES[0];
    const root = document.documentElement;
    const hexToHsl = (hex: string): string => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
          case g: h = ((b - r) / d + 2); break;
          case b: h = ((r - g) / d + 4); break;
        }
        h /= 6;
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    const bgHsl = hexToHsl(theme.bg);
    const primaryHsl = hexToHsl(theme.primary);
    const accentHsl = hexToHsl(theme.accent);
    root.style.setProperty('--background', bgHsl);
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--ring', primaryHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--foreground', `${primaryHsl.split(' ')[0]} 10% 88%`);
    root.style.setProperty('--card', `${bgHsl.split(' ')[0]} 15% 12%`);
    root.style.setProperty('--card-foreground', `${primaryHsl.split(' ')[0]} 10% 88%`);
    root.style.setProperty('--border', `${primaryHsl.split(' ')[0]} 10% 22%`);
    root.style.setProperty('--secondary', `${bgHsl.split(' ')[0]} 12% 18%`);
    root.style.setProperty('--muted', `${bgHsl.split(' ')[0]} 12% 18%`);
    root.style.setProperty('--popover', `${bgHsl.split(' ')[0]} 15% 10%`);
    root.style.setProperty('--popover-foreground', `${primaryHsl.split(' ')[0]} 10% 88%`);
    root.style.setProperty('--input', `${primaryHsl.split(' ')[0]} 10% 20%`);
    root.style.setProperty('--destructive', primaryHsl);
    root.style.setProperty('--destructive-foreground', `${primaryHsl.split(' ')[0]} 10% 88%`);
    root.style.setProperty('--muted-foreground', `${primaryHsl.split(' ')[0]} 8% 55%`);
    root.style.setProperty('--accent-foreground', `${primaryHsl.split(' ')[0]} 10% 88%`);
    root.style.setProperty('--secondary-foreground', `${primaryHsl.split(' ')[0]} 10% 88%`);
    root.style.setProperty('--tac-primary', theme.primary);
    root.style.setProperty('--tac-accent', theme.accent);
    root.style.setProperty('--tac-bg', theme.bg);
  }, [uiTheme]);

  const selectCharacter = useCallback((id: string) => {
    setSelectedCharacter(id);
    saveData({ selectedCharacter: id });
  }, []);

  const selectShip = useCallback((id: string) => {
    setSelectedShip(id);
    saveData({ selectedShip: id });
  }, []);

  const selectZombie = useCallback((id: string) => {
    setSelectedZombie(id);
    saveData({ selectedZombie: id });
  }, []);

  const setLoggedIn = useCallback((v: boolean, playerEmail?: string) => {
    setLoggedInState(v);
    if (playerEmail) {
      setEmail(playerEmail);
      const name = playerEmail.split('@')[0] ?? 'Player';
      setPlayerName(name);
      saveData({ loggedIn: v, email: playerEmail, playerName: name });
    } else {
      saveData({ loggedIn: v });
    }
  }, []);

  const recordRouletteSpin = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    const newSpins = lastRouletteDate === today ? rouletteSpinsToday + 1 : 1;
    setLastRouletteDate(today);
    setRouletteSpinsToday(newSpins);
    saveData({ lastRouletteDate: today, rouletteSpinsToday: newSpins });
  }, [lastRouletteDate, rouletteSpinsToday]);

  const addSuggestion = useCallback((text: string) => {
    const entry = { id: Date.now(), text, date: new Date().toISOString() };
    setSuggestions((prev) => {
      const next = [...prev, entry];
      saveData({ suggestions: next });
      return next;
    });
    if (!isOnline) return;
    try {
      addDoc(collection(db, 'suggestions'), {
        text,
        date: serverTimestamp(),
      }).catch(() => {});
    } catch {}
  }, [isOnline]);

  const getChar = useCallback(() => getCharacter(selectedCharacter), [selectedCharacter]);
  const getShipDef = useCallback(() => getShip(selectedShip), [selectedShip]);
  const getZombieChar = useCallback(() => getZombieCharacter(selectedZombie), [selectedZombie]);

  const buyUpgrade = useCallback((key: keyof UpgradeState, cost: number): boolean => {
    if (!spendCoins(cost)) return false;
    setUpgrades((prevUp) => {
      const nextUp = { ...prevUp, [key]: prevUp[key] + 1 };
      saveData({ upgrades: nextUp });
      return nextUp;
    });
    return true;
  }, [spendCoins]);

  const completeLevel = useCallback((level: number, stars: number, coinsEarned: number) => {
    const isFirstClear = !campaignProgress.stars[level];
    const rewardRange = getCampaignCoinReward(level);
    const guaranteedCoins = Math.max(rewardRange.min, Math.min(rewardRange.max, coinsEarned || Math.floor((rewardRange.min + rewardRange.max) / 2)));
    addCoins(guaranteedCoins);
    setCampaignProgress((prev) => {
      const newStars = { ...prev.stars, [level]: Math.max(prev.stars[level] ?? 0, stars) };
      const newLevel = Math.max(prev.currentLevel, level + 1);
      const keysEarned = isFirstClear && level % 10 === 0 ? CAMPAIGN_KEYS_PER_10_LEVELS : 0;
      const newKeys = prev.keys + keysEarned;
      const next = { currentLevel: newLevel, stars: newStars, keys: newKeys, diamondsClaimed: prev.diamondsClaimed, lastLevelCompletedAt: Date.now() };
      saveData({ campaignProgress: next });
      const user = auth.currentUser;
      if (user) {
        try {
          updateDoc(doc(db, 'usuarios', user.uid), {
            campaignLevel: newLevel,
            campaignKeys: newKeys,
            campaignStars: newStars,
            coins: coins + guaranteedCoins,
            lastActive: serverTimestamp(),
          }).catch(() => {});
        } catch {}
      }
      return next;
    });
  }, [campaignProgress.stars, addCoins, coins]);

  const getCurrentCampaignLevel = useCallback(() => campaignProgress.currentLevel, [campaignProgress.currentLevel]);

  const canExchangeDiamonds = useCallback((): { ok: boolean; reason?: string } => {
    if (coins < MIN_CLAIM_COINS) return { ok: false, reason: `Necesitas ${MIN_CLAIM_COINS.toLocaleString()} monedas.` };
    if (campaignProgress.keys < DIAMOND_CLAIM_KEYS_REQUIRED) return { ok: false, reason: `Necesitas ${DIAMOND_CLAIM_KEYS_REQUIRED} llaves de campaña.` };
    if (campaignProgress.lastLevelCompletedAt) {
      const daysSinceActivity = (Date.now() - campaignProgress.lastLevelCompletedAt) / (1000 * 60 * 60 * 24);
      if (daysSinceActivity > RECENT_ACTIVITY_REQUIRED_DAYS) return { ok: false, reason: 'Debes haber jugado una partida en los ultimos 7 dias.' };
    } else {
      return { ok: false, reason: 'Debes completar al menos un nivel de campaña primero.' };
    }
    return { ok: true };
  }, [coins, campaignProgress.keys, campaignProgress.lastLevelCompletedAt]);

  const getCampaignKeyPrice = useCallback((): number => {
    return getConfigCampaignKeyPrice(campaignProgress.keys);
  }, [campaignProgress.keys]);

  const buyCampaignKey = useCallback((): { ok: boolean; error?: string } => {
    const price = getConfigCampaignKeyPrice(campaignProgress.keys);
    if (!spendCoins(price)) return { ok: false, error: 'No tienes suficientes monedas.' };
    setCampaignProgress((prev) => {
      const next = { ...prev, keys: prev.keys + 1 };
      saveData({ campaignProgress: next });
      const user = auth.currentUser;
      if (user) {
        try { updateDoc(doc(db, 'usuarios', user.uid), { campaignKeys: next.keys }).catch(() => {}); } catch {}
      }
      return next;
    });
    return { ok: true };
  }, [campaignProgress.keys, spendCoins]);

  const addCampaignKeyFromAd = useCallback(() => {
    setCampaignProgress((prev) => {
      const next = { ...prev, keys: prev.keys + 1 };
      saveData({ campaignProgress: next });
      const user = auth.currentUser;
      if (user) {
        try { updateDoc(doc(db, 'usuarios', user.uid), { campaignKeys: next.keys }).catch(() => {}); } catch {}
      }
      return next;
    });
  }, []);

  const refreshOperatorLogs = useCallback(async () => {
    try {
      const q = query(collection(db, 'logs_operadores'), limit(50));
      const snap = await getDocs(q);
      const logs: OperatorLogEntry[] = [];
      snap.forEach((d) => {
        const data = d.data();
        let ts = 0;
        if (data.timestamp && typeof data.timestamp.toDate === 'function') ts = data.timestamp.toDate().getTime();
        else if (data.timestamp) ts = new Date(data.timestamp).getTime();
        logs.push({
          id: d.id,
          operatorUid: data.operatorUid ?? '',
          operatorName: data.operatorName ?? '',
          action: data.action ?? '',
          details: data.details ?? '',
          timestamp: ts,
        });
      });
      logs.sort((a, b) => b.timestamp - a.timestamp);
      setOperatorLogs(logs);
    } catch {}
  }, []);

  const exchangeDiamonds = useCallback(async (playerID: string, nickname: string): Promise<{ ok: boolean; error?: string }> => {
    const check = canExchangeDiamonds();
    if (!check.ok) return { ok: false, error: check.reason };
    if (!playerID.trim() || playerID.trim().length < 4) return { ok: false, error: 'Player ID invalido.' };
    if (!nickname.trim() || nickname.trim().length < 2) return { ok: false, error: 'Nickname invalido.' };
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'Debes iniciar sesion.' };
      if (!spendCoins(MIN_CLAIM_COINS)) return { ok: false, error: 'No se pudieron descontar las monedas.' };
      setCampaignProgress((prev) => {
        const next = { ...prev, keys: prev.keys - DIAMOND_CLAIM_KEYS_REQUIRED, diamondsClaimed: true };
        saveData({ campaignProgress: next });
        return next;
      });
      const newReqRef = doc(collection(db, 'canjes'));
      await setDoc(newReqRef, {
        id: newReqRef.id,
        userId: user.uid,
        userName: nickname.trim(),
        gameId: 'free_fire',
        selectedReward: 'Recarga de Diamantes',
        coinCost: MIN_CLAIM_COINS,
        keyCost: DIAMOND_CLAIM_KEYS_REQUIRED,
        estimatedUsdValue: 1.0,
        status: 'pending_review',
        createdAt: Date.now(),
        queuePosition: 0,
        playerID: playerID.trim(),
        nickname: nickname.trim(),
        correctionDeadline: null,
        approvedAt: null,
        rejectedAt: null,
        rejectReason: '',
        type: 'diamond_exchange',
      });
      await updateDoc(doc(db, 'usuarios', user.uid), {
        coins: coins - MIN_CLAIM_COINS,
        campaignKeys: Math.max(0, campaignProgress.keys - DIAMOND_CLAIM_KEYS_REQUIRED),
        lastActive: serverTimestamp(),
      }).catch(() => {});
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar';
      return { ok: false, error: msg };
    }
  }, [canExchangeDiamonds, spendCoins, coins, campaignProgress.keys]);

  const buyTower = useCallback((tower: keyof TowerLevel, cost: number): boolean => {
    if (!spendCoins(cost)) return false;
    setTowerLevels((prev) => {
      const next = { ...prev, [tower]: (prev[tower] ?? 0) + 1 };
      saveData({ towerLevels: next });
      const user = auth.currentUser;
      if (user) {
        try { updateDoc(doc(db, 'usuarios', user.uid), { towerLevels: next }).catch(() => {}); } catch {}
      }
      return next;
    });
    return true;
  }, [spendCoins]);

  const getTowerLevel = useCallback((tower: keyof TowerLevel) => towerLevels[tower] ?? 0, [towerLevels]);

  const submitSurvivalScore = useCallback(async (timeMs: number) => {
    if (timeMs > survivalBestTime) {
      setSurvivalBestTime(timeMs);
      saveData({ survivalBestTime: timeMs });
    }
    if (!isOnline) return;
    try {
      const user = auth.currentUser;
      const playerNameToUse = playerName || email.split('@')[0] || 'Player';
      const uid = user?.uid ?? 'anonymous';
      await addDoc(collection(db, 'scores_survival'), {
        name: playerNameToUse, uid, timeMs, date: serverTimestamp(),
      });
      if (user) {
        try { updateDoc(doc(db, 'usuarios', user.uid), { lastActive: serverTimestamp() }).catch(() => {}); } catch {}
      }
    } catch {}
  }, [isOnline, survivalBestTime, playerName, email]);

  const dismissWelcomeBonus = useCallback(() => setShowWelcomeBonus(false), []);
  const dismissReturnReward = useCallback(() => setShowReturnReward(false), []);
  const dismissExchangeNotification = useCallback(() => {
    setExchangeNotification(null);
    const user = auth.currentUser;
    if (!user) return;
    try {
      getDocs(query(
        collection(db, 'notificaciones'),
        where('userId', '==', user.uid),
        where('read', '==', false)
      )).then((snap) => {
        snap.forEach((d) => updateDoc(doc(db, 'notificaciones', d.id), { read: true }).catch(() => {}));
      }).catch(() => {});
    } catch {}
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const q = query(
        collection(db, 'notificaciones'),
        where('userId', '==', user.uid),
        where('read', '==', false),
        limit(1)
      );
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const data = snap.docs[0].data();
          if (data.message) setExchangeNotification(data.message as string);
        }
      }, () => {});
      return () => unsub();
    } catch { return; }
  }, [loggedIn]);

  const refreshCampaignLevelStats = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(db, 'usuarios'), limit(100)));
      const counts: Record<number, number> = {};
      snap.forEach((d) => {
        const data = d.data();
        const lvl = data.campaignLevel ?? 1;
        counts[lvl] = (counts[lvl] ?? 0) + 1;
      });
      const stats: CampaignLevelStat[] = Object.entries(counts)
        .map(([lvl, count]) => ({ level: parseInt(lvl, 10), activePlayers: count }))
        .sort((a, b) => a.level - b.level);
      setCampaignLevelStats(stats);
    } catch {}
  }, []);

  const refreshRanking = useCallback(async () => {
    try {
      const spaceQ = query(collection(db, 'usuarios'), orderBy('puntos_espacio', 'desc'), limit(RANKING_PAGE_SIZE));
      const spaceSnap = await getDocs(spaceQ);
      const spaceEntries: RankEntry[] = [];
      spaceSnap.forEach((d) => {
        const data = d.data();
        spaceEntries.push({ name: data.nombre || data.email?.split('@')[0] || 'Jugador', score: data.puntos_espacio ?? 0, uid: d.id });
      });
      setSpaceRanking(fillWithBots(spaceEntries, 'space'));

      const zombieQ = query(collection(db, 'usuarios'), orderBy('puntos_zombies', 'desc'), limit(RANKING_PAGE_SIZE));
      const zombieSnap = await getDocs(zombieQ);
      const zombieEntries: RankEntry[] = [];
      zombieSnap.forEach((d) => {
        const data = d.data();
        zombieEntries.push({ name: data.nombre || data.email?.split('@')[0] || 'Jugador', score: data.puntos_zombies ?? 0, uid: d.id });
      });
      setZombieRanking(fillWithBots(zombieEntries, 'zombie'));
    } catch {}
  }, []);

  const refreshWeeklyRanking = useCallback(async () => {
    try {
      const weeklyQ = query(collection(db, 'usuarios'), orderBy('puntos_semanales', 'desc'), limit(RANKING_PAGE_SIZE));
      const weeklySnap = await getDocs(weeklyQ);
      const weeklyEntries: RankEntry[] = [];
      weeklySnap.forEach((d) => {
        const data = d.data();
        weeklyEntries.push({ name: data.nombre || data.email?.split('@')[0] || 'Jugador', score: data.puntos_semanales ?? 0, uid: d.id });
      });
      setWeeklyRanking(fillWithBots(weeklyEntries, 'weekly'));
    } catch {}
  }, []);

  const loadMoreRanking = useCallback(async (_type: 'space' | 'zombie' | 'weekly') => {
    return Promise.resolve();
  }, []);

  const hasMoreRanking = useCallback((_type: 'space' | 'zombie' | 'weekly') => false, []);

  const fillWithBots = useCallback((entries: RankEntry[], _field: 'space' | 'zombie' | 'weekly'): RankEntry[] => {
    return entries.slice(0, 15);
  }, []);

  useEffect(() => {
    const unsubs: Array<() => void> = [];
    try {
      const spaceQ = query(collection(db, 'usuarios'), orderBy('puntos_espacio', 'desc'), limit(RANKING_PAGE_SIZE));
      unsubs.push(onSnapshot(spaceQ, (snap) => {
        const entries: RankEntry[] = [];
        snap.forEach((d) => {
          const data = d.data();
          entries.push({ name: data.nombre || data.email?.split('@')[0] || 'Jugador', score: data.puntos_espacio ?? 0, uid: d.id });
        });
        setSpaceRanking(fillWithBots(entries, 'space'));
      }, () => setSpaceRanking(fillWithBots([], 'space'))));

      const zombieQ = query(collection(db, 'usuarios'), orderBy('puntos_zombies', 'desc'), limit(RANKING_PAGE_SIZE));
      unsubs.push(onSnapshot(zombieQ, (snap) => {
        const entries: RankEntry[] = [];
        snap.forEach((d) => {
          const data = d.data();
          entries.push({ name: data.nombre || data.email?.split('@')[0] || 'Jugador', score: data.puntos_zombies ?? 0, uid: d.id });
        });
        setZombieRanking(fillWithBots(entries, 'zombie'));
      }, () => setZombieRanking(fillWithBots([], 'zombie'))));

      const survivalQ = query(collection(db, 'scores_survival'), orderBy('timeMs', 'desc'), limit(RANKING_PAGE_SIZE));
      unsubs.push(onSnapshot(survivalQ, (snap) => {
        const entries: RankEntry[] = [];
        snap.forEach((d) => {
          const data = d.data();
          entries.push({ name: data.name || 'Jugador', score: data.timeMs ?? 0, uid: data.uid });
        });
        setSurvivalRanking(entries.slice(0, 15));
      }, () => setSurvivalRanking([])));

      const weeklyQ = query(collection(db, 'usuarios'), orderBy('puntos_semanales', 'desc'), limit(RANKING_PAGE_SIZE));
      unsubs.push(onSnapshot(weeklyQ, (snap) => {
        const entries: RankEntry[] = [];
        snap.forEach((d) => {
          const data = d.data();
          entries.push({ name: data.nombre || data.email?.split('@')[0] || 'Jugador', score: data.puntos_semanales ?? 0, uid: d.id });
        });
        setWeeklyRanking(fillWithBots(entries, 'weekly'));
      }, () => setWeeklyRanking(fillWithBots([], 'weekly'))));
    } catch {}
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'operador') return;
    let cancelled = false;
    const loadFirstPage = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'usuarios'), orderBy('coins', 'desc'), limit(50)));
        if (cancelled) return;
        const users: Array<{
          uid: string; nombre: string; email: string; coins: number;
          puntos: number; vip: boolean; playerID: string; nickname: string;
          tiempo_jugado_min: number; tiempo_app_min: number; createdAt: unknown;
          lastActive: unknown; banned: boolean; currentRequest: string;
        }> = [];
        snap.forEach((d) => {
          const data = d.data();
          users.push({
            uid: d.id,
            nombre: data.nombre ?? data.email?.split('@')[0] ?? 'Jugador',
            email: data.email ?? '',
            coins: data.coins ?? 0,
            puntos: (data.puntos_espacio ?? 0) + (data.puntos_zombies ?? 0) + (data.puntos_semanales ?? 0),
            vip: data.vip ?? false,
            playerID: data.playerID ?? '',
            nickname: data.nickname ?? data.nombre ?? '',
            tiempo_jugado_min: data.tiempo_jugado_min ?? 0,
            tiempo_app_min: data.tiempo_app_min ?? 0,
            createdAt: data.createdAt ?? null,
            lastActive: data.lastActive ?? null,
            banned: data.banned ?? false,
            currentRequest: data.currentRequest ?? '',
          });
        });
        setAllUsersList(users);
        setHasMoreUsers(snap.size === 50);
        userSearchCursorRef.current = 50;
      } catch {}
    };
    loadFirstPage();
    return () => { cancelled = true; };
  }, [userRole]);

  const getFreeSpinsRemaining = useCallback((): number => {
    const today = new Date().toISOString().slice(0, 10);
    const isToday = lastRouletteDate === today;
    const used = isToday ? rouletteSpinsToday : 0;
    const maxFree = vip ? 3 : 1;
    return Math.max(0, maxFree - used);
  }, [lastRouletteDate, rouletteSpinsToday, vip]);

  const submitSpaceScore = useCallback(async (score: number) => {
    if (!isOnline) return;
    try {
      const user = auth.currentUser;
      const playerNameToUse = playerName || email.split('@')[0] || 'Player';
      const uid = user?.uid ?? 'anonymous';
      const scoreDoc = {
        name: playerNameToUse, score, uid, date: serverTimestamp(),
      };
      await addDoc(collection(db, 'scores_space'), scoreDoc);
      const weekStart = getStartOfWeek();
      await setDoc(doc(db, 'scores_weekly', `${uid}_${weekStart.toISOString().slice(0,10)}`), {
        ...scoreDoc, weekStart,
      }, { merge: true });
      setSpaceRanking((prev) => {
        const next = [...prev, { name: playerNameToUse, score, uid }];
        next.sort((a, b) => b.score - a.score);
        return next.slice(0, 20);
      });
      if (score > absoluteRecord) {
        await setDoc(doc(db, 'global', 'top1'), { name: playerNameToUse, score, uid }, { merge: true });
        setAbsoluteRecord(score);
        setTopPlayerName(playerNameToUse);
        setTopPlayerScore(score);
      }
      endGameBatch();
      if (user) {
        const userRef = doc(db, 'usuarios', user.uid);
        const userDoc = await getDoc(userRef);
        const totalRuns = (userDoc.data()?.totalRuns ?? 0) + 1;
        const bestScore = Math.max(userDoc.data()?.bestScore ?? 0, score);
        const currentSpacePoints = userDoc.data()?.puntos_espacio ?? 0;
        await updateDoc(userRef, {
          totalRuns, bestScore,
          puntos_espacio: currentSpacePoints + score,
          puntos_semanales: (userDoc.data()?.puntos_semanales ?? 0) + score,
          lastActive: serverTimestamp(),
        });
      }
      cacheInvalidatePattern('ranking');
    } catch { endGameBatch(); }
  }, [email, playerName, absoluteRecord, isOnline, coins, endGameBatch]);

  const submitZombieScore = useCallback(async (score: number) => {
    if (!isOnline) return;
    try {
      const user = auth.currentUser;
      const playerNameToUse = playerName || email.split('@')[0] || 'Player';
      const uid = user?.uid ?? 'anonymous';
      const scoreDoc = {
        name: playerNameToUse, score, uid, date: serverTimestamp(),
      };
      await addDoc(collection(db, 'scores_zombie'), scoreDoc);
      const weekStart = getStartOfWeek();
      await setDoc(doc(db, 'scores_weekly', `${uid}_${weekStart.toISOString().slice(0,10)}`), {
        ...scoreDoc, weekStart,
      }, { merge: true });
      setZombieRanking((prev) => {
        const next = [...prev, { name: playerNameToUse, score, uid }];
        next.sort((a, b) => b.score - a.score);
        return next.slice(0, 20);
      });
      if (score > absoluteRecord) {
        await setDoc(doc(db, 'global', 'top1'), { name: playerNameToUse, score, uid }, { merge: true });
        setAbsoluteRecord(score);
        setTopPlayerName(playerNameToUse);
        setTopPlayerScore(score);
      }
      endGameBatch();
      if (user) {
        const userRef = doc(db, 'usuarios', user.uid);
        const userDoc = await getDoc(userRef);
        const totalRuns = (userDoc.data()?.totalRuns ?? 0) + 1;
        const bestScore = Math.max(userDoc.data()?.bestScore ?? 0, score);
        const currentZombiePoints = userDoc.data()?.puntos_zombies ?? 0;
        await updateDoc(userRef, {
          totalRuns, bestScore,
          puntos_zombies: currentZombiePoints + score,
          puntos_semanales: (userDoc.data()?.puntos_semanales ?? 0) + score,
          lastActive: serverTimestamp(),
        });
      }
      cacheInvalidatePattern('ranking');
    } catch { endGameBatch(); }
  }, [email, playerName, absoluteRecord, isOnline, endGameBatch]);

  const canShowInterstitial = useCallback(() => {
    const now = Date.now();
    return now - lastInterstitialTimeRef.current >= INTERSTITIAL_COOLDOWN_MS;
  }, []);

  const recordInterstitial = useCallback(() => {
    lastInterstitialTimeRef.current = Date.now();
  }, []);

  const signIn = useCallback(async (emailAddr: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, emailAddr, password);
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesion';
      return { ok: false, error: msg };
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = cred.user.uid;
      try { await cred.user.getIdToken(true); } catch {}
      await setDoc(doc(db, 'usuarios', uid), {
        nombre: data.fullName,
        edad: data.age,
        pais: data.country,
        email: data.email,
        coins: WELCOME_BONUS_COINS,
        totalRuns: 0,
        bestScore: 0,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        rol: 'user',
        welcomeBonusClaimed: true,
        campaignLevel: 1,
        campaignKeys: WELCOME_BONUS_KEYS,
        campaignStars: {},
        towerLevels: { turret: 0, drone: 0, medic: 0 },
      });
      const name = data.email.split('@')[0] ?? 'Player';
      setPlayerName(name);
      setShowWelcomeBonus(true);
      saveData({ playerName: name });

      try {
        const refParam = new URLSearchParams(window.location.search).get('ref');
        if (refParam && refParam.startsWith('GARR-')) {
          const refRows = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''}/rest/v1/referrals?select=referrer_uid,referral_code,status`,
            {
              headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (refRows.ok) {
            const rows = await refRows.json() as Array<{ referrer_uid: string; referral_code: string; status: string }>;
            const ref = rows.find((r) => r.referral_code === refParam && r.status === 'pending');
            if (ref && ref.referrer_uid !== uid) {
              await updateDoc(doc(db, 'usuarios', ref.referrer_uid), { coins: increment(200) });
              await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''}/rest/v1/referrals?referral_code=eq.${refParam}`,
                {
                  method: 'PATCH',
                  headers: {
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ status: 'rewarded', referred_uid: uid }),
                }
              );
            }
          }
        }
      } catch {}

      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar';
      return { ok: false, error: msg };
    }
  }, []);

  const logOut = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {}
    setLoggedInState(false);
    setUserRole('user');
    saveData({ loggedIn: false });
    setScreenState('login');
  }, []);

  const claimDiamonds = useCallback(async (playerID: string, nickname: string): Promise<{ ok: boolean; error?: string }> => {
    if (!playerID.trim() || playerID.trim().length < 4) return { ok: false, error: 'Player ID invalido (minimo 4 caracteres).' };
    if (!nickname.trim() || nickname.trim().length < 2) return { ok: false, error: 'Nickname invalido.' };
    if (points < 10) return { ok: false, error: 'No tienes suficientes puntos (necesitas 10).' };
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'Debes iniciar sesion.' };
      if (!spendPoints(10)) return { ok: false, error: 'No se pudieron descontar los puntos.' };
      await addDoc(collection(db, 'canjes'), {
        userId: user.uid,
        playerID: playerID.trim(),
        nickname: nickname.trim(),
        tiempoJugado: scoreRef.current || 0,
        puntosGastados: 10,
        gameId: 'free_fire',
        selectedReward: 'Canje de Puntos',
        coinCost: 0,
        keyCost: 0,
        estimatedUsdValue: 0,
        status: 'pending_review',
        createdAt: Date.now(),
        queuePosition: 0,
        type: 'points_exchange',
      });
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la solicitud';
      return { ok: false, error: msg };
    }
  }, [points, spendPoints]);

  const sendSuggestion = useCallback(async (text: string): Promise<{ ok: boolean; error?: string }> => {
    if (text.trim().length < 5) return { ok: false, error: 'La sugerencia debe tener al menos 5 caracteres.' };
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'sugerencias'), {
        userId: user?.uid ?? 'anonymous',
        correo: user?.email ?? email ?? 'anonymous',
        mensaje: text.trim(),
        fecha: serverTimestamp(),
      });
      const entry = { id: Date.now(), text: text.trim(), date: new Date().toISOString() };
      setSuggestions((prev) => {
        const next = [...prev, entry];
        saveData({ suggestions: next });
        return next;
      });
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar sugerencia';
      return { ok: false, error: msg };
    }
  }, [email]);

  const refreshOfferwallConfig = useCallback(async () => {
    try {
      const snap = await getDoc(doc(db, 'config', 'offerwall'));
      if (snap.exists()) {
        const data = snap.data();
        setOfferwallConfig({
          active: data.active ?? false,
          link: data.link ?? '',
          rewardPerDownload: data.rewardPerDownload ?? 20,
          dailyLimit: data.dailyLimit ?? 2,
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    refreshOfferwallConfig();
    const interval = setInterval(refreshOfferwallConfig, 30000);
    return () => clearInterval(interval);
  }, [refreshOfferwallConfig]);

  const recordOfferwallDownload = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!offerwallConfig?.active) return { ok: false, error: 'Las misiones de descarga no estan activas.' };
    if (offerwallDownloadsToday >= offerwallConfig.dailyLimit) return { ok: false, error: 'Limite alcanzado. Vuelve manana por mas!' };
    try {
      addCoins(offerwallConfig.rewardPerDownload);
      setOfferwallDownloadsToday((prev) => prev + 1);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error al procesar la recompensa.' };
    }
  }, [offerwallConfig, offerwallDownloadsToday, addCoins]);

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    const timeout = setTimeout(() => {
      setOfferwallDownloadsToday(0);
      const interval = setInterval(() => setOfferwallDownloadsToday(0), 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, msUntilMidnight);
    return () => clearTimeout(timeout);
  }, []);

  const refreshPendingRequests = useCallback(async () => {
    return Promise.resolve();
  }, []);

  useEffect(() => {
    try {
      const q = query(collection(db, 'solicitudes_pendientes'), where('estado', '==', 'pendiente'));
      const unsub = onSnapshot(q, (snap) => {
        const reqs: PendingRequest[] = [];
        snap.forEach((d) => {
          const data = d.data();
          reqs.push({
            id: d.id,
            userId: data.userId ?? '',
            playerID: data.playerID ?? '',
            nickname: data.nickname ?? '',
            tiempoJugado: data.tiempoJugado ?? 0,
            puntosGastados: data.puntosGastados ?? 0,
            fecha: data.fecha,
            estado: data.estado ?? 'pendiente',
          });
        });
        setPendingRequests(reqs);
      }, () => {});
      return () => unsub();
    } catch { return; }
  }, []);

  const confirmPendingRequest = useCallback(async (requestId: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'No autenticado' };
      const reqRef = doc(db, 'solicitudes_pendientes', requestId);
      const reqDoc = await getDoc(reqRef);
      if (!reqDoc.exists()) return { ok: false, error: 'Solicitud no encontrada' };
      const requestData = reqDoc.data();
      await setDoc(doc(db, 'solicitudes_confirmadas', requestId), {
        ...requestData,
        estado: 'completado',
        procesadoPor: user.uid,
        procesadoFecha: serverTimestamp(),
      });
      await deleteDoc(reqRef);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      if (operatorTurn) {
        const prizeAmount = (requestData.puntosGastados ?? 0) / 10 * (COINS_PER_USD / 100);
        setOperatorTurn((prev) => prev ? {
          ...prev,
          prizesPaid: prev.prizesPaid + (requestData.puntosGastados ?? 0),
          currentBalance: prev.currentBalance - prizeAmount,
        } : null);
      }
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al confirmar solicitud';
      return { ok: false, error: msg };
    }
  }, [operatorTurn]);

  const rejectPendingRequest = useCallback(async (requestId: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'No autenticado' };
      const reqRef = doc(db, 'solicitudes_pendientes', requestId);
      const reqDoc = await getDoc(reqRef);
      if (!reqDoc.exists()) return { ok: false, error: 'Solicitud no encontrada' };
      const requestData = reqDoc.data();
      await setDoc(doc(db, 'solicitudes_confirmadas', requestId), {
        ...requestData,
        estado: 'rechazado',
        procesadoPor: user.uid,
        procesadoFecha: serverTimestamp(),
      });
      await deleteDoc(reqRef);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al rechazar solicitud';
      return { ok: false, error: msg };
    }
  }, []);

  const refreshCanjes = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDocs(query(
        collection(db, 'canjes'),
        where('userId', '==', user.uid)
      ));
      const list: CanjeRequest[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          userId: data.userId ?? '',
          userName: data.userName ?? '',
          gameId: data.gameId ?? 'free_fire',
          selectedReward: data.selectedReward ?? '',
          coinCost: data.coinCost ?? 0,
          keyCost: data.keyCost ?? 0,
          estimatedUsdValue: data.estimatedUsdValue ?? 0,
          status: data.status ?? 'pending_review',
          createdAt: data.createdAt ?? 0,
          queuePosition: data.queuePosition ?? 0,
          playerID: data.playerID ?? '',
          nickname: data.nickname ?? '',
          correctionDeadline: data.correctionDeadline ?? null,
          approvedAt: data.approvedAt ?? null,
          rejectedAt: data.rejectedAt ?? null,
          rejectReason: data.rejectReason ?? '',
        });
      });
      list.sort((a, b) => b.createdAt - a.createdAt);
      setCanjes(list);

      const approvedSnap = await getDocs(query(
        collection(db, 'canjes_aprobadas'),
        where('userId', '==', user.uid)
      ));
      const approvedList: CanjeRequest[] = [];
      approvedSnap.forEach((d) => {
        const data = d.data();
        approvedList.push({
          id: d.id,
          userId: data.userId ?? '',
          userName: data.userName ?? '',
          gameId: data.gameId ?? 'free_fire',
          selectedReward: data.selectedReward ?? '',
          coinCost: data.coinCost ?? 0,
          keyCost: data.keyCost ?? 0,
          estimatedUsdValue: data.estimatedUsdValue ?? 0,
          status: 'approved',
          createdAt: data.createdAt ?? 0,
          queuePosition: 0,
          playerID: data.playerID ?? '',
          nickname: data.nickname ?? '',
          approvedAt: data.approvedAt ?? null,
        });
      });
      approvedList.sort((a, b) => (b.approvedAt ?? 0) - (a.approvedAt ?? 0));
      setApprovedCanjes(approvedList);
    } catch {}
  }, []);

  const submitCanje = useCallback(async (rewardId: string, gameId: CanjeGameId, playerID: string, nickname: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'No autenticado' };
      const reward = getRewardById(rewardId);
      if (!reward) return { ok: false, error: 'Recompensa no encontrada' };
      if (playerID.trim().length < 4) return { ok: false, error: 'Player ID demasiado corto' };
      if (nickname.trim().length < 2) return { ok: false, error: 'Nickname demasiado corto' };

      // Prevent double request: check for existing pending canje from this user
      const existingPendingSnap = await getDocs(query(
        collection(db, 'canjes'),
        where('userId', '==', user.uid),
        where('status', 'in', ['pending_review', 'waiting_correction'])
      ));
      if (!existingPendingSnap.empty) {
        return { ok: false, error: 'Ya tienes un canje pendiente. Espera a que se procese.' };
      }

      const pendingSnap = await getDocs(query(
        collection(db, 'canjes'),
        where('status', 'in', ['pending_review', 'waiting_correction'])
      ));
      const queuePosition = pendingSnap.size + 1;

      const newCanjeRef = doc(collection(db, 'canjes'));
      const userRef = doc(db, 'usuarios', user.uid);
      const now = Date.now();

      // Atomic transaction: verify balances + deduct + create canje in one step
      await runTransaction(db, async (tx) => {
        const userDoc = await tx.get(userRef);
        if (!userDoc.exists()) throw new Error('Usuario no encontrado');
        const userData = userDoc.data();
        const currentCoins = userData.coins ?? 0;
        const currentKeys = userData.campaignKeys ?? 0;
        if (currentCoins < reward.coinCost) throw new Error('Monedas insuficientes');
        if (currentKeys < reward.keyCost) throw new Error('Llaves insuficientes');

        tx.set(newCanjeRef, {
          id: newCanjeRef.id,
          userId: user.uid,
          userName: nickname,
          gameId,
          selectedReward: reward.label,
          coinCost: reward.coinCost,
          keyCost: reward.keyCost,
          estimatedUsdValue: reward.usdValue,
          status: 'pending_review',
          createdAt: now,
          queuePosition,
          playerID: playerID.trim(),
          nickname: nickname.trim(),
          correctionDeadline: null,
          approvedAt: null,
          rejectedAt: null,
          rejectReason: '',
        });
        tx.update(userRef, {
          coins: currentCoins - reward.coinCost,
          campaignKeys: Math.max(0, currentKeys - reward.keyCost),
        });
      });

      // Update local state after successful transaction
      setCoins((prev) => Math.max(0, prev - reward.coinCost));
      if (typeof window !== 'undefined') {
        const newKeys = Math.max(0, campaignProgress.keys - reward.keyCost);
        localStorage.setItem('campaignKeys', String(newKeys));
      }

      await refreshCanjes();

      // Notify admins/operators about the new canje request
      try {
        const adminSnap = await getDocs(query(
          collection(db, 'usuarios'),
          where('rol', 'in', ['admin', 'operador'])
        ));
        const adminPromises: Promise<unknown>[] = [];
        adminSnap.forEach((d) => {
          const adminData = d.data();
          const fcmToken = adminData.fcmToken;
          adminPromises.push(
            addDoc(collection(db, 'notificaciones'), {
              userId: d.id,
              title: '💎 NUEVO CANJE — GARRDASH',
              message: 'Hay una nueva solicitud de canje pendiente. Revísala en Comando.',
              type: 'admin_canje_alert',
              createdAt: now,
              read: false,
            }).catch(() => {})
          );
          if (fcmToken) {
            adminPromises.push(
              fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `key=913250323167`,
                },
                body: JSON.stringify({
                  to: fcmToken,
                  notification: {
                    title: '💎 NUEVO CANJE — GARRDASH',
                    body: 'Hay una nueva solicitud de canje pendiente. Revísala en Comando.',
                    icon: '/ic_launcher_foreground.webp',
                    click_action: '/',
                  },
                  data: { type: 'admin_canje_alert' },
                }),
              }).catch(() => {})
            );
          }
        });
        await Promise.all(adminPromises);
      } catch {}

      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar canje';
      return { ok: false, error: msg };
    }
  }, [campaignProgress.keys, refreshCanjes]);

  const correctCanjeId = useCallback(async (canjeId: string, newPlayerID: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      if (newPlayerID.trim().length < 4) return { ok: false, error: 'Player ID demasiado corto' };
      const canjeRef = doc(db, 'canjes', canjeId);
      const canjeDoc = await getDoc(canjeRef);
      if (!canjeDoc.exists()) return { ok: false, error: 'Canje no encontrado' };
      const data = canjeDoc.data();
      if (data.status !== 'waiting_correction') return { ok: false, error: 'El canje no está en corrección' };
      await updateDoc(canjeRef, {
        playerID: newPlayerID.trim(),
        status: 'pending_review',
        correctionDeadline: null,
      });
      await refreshCanjes();
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al corregir ID';
      return { ok: false, error: msg };
    }
  }, [refreshCanjes]);

  const cancelCanje = useCallback(async (canjeId: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'No autenticado' };
      const canjeRef = doc(db, 'canjes', canjeId);
      const userRef = doc(db, 'usuarios', user.uid);

      await runTransaction(db, async (tx) => {
        const canjeDoc = await tx.get(canjeRef);
        if (!canjeDoc.exists()) throw new Error('Canje no encontrado');
        const data = canjeDoc.data();
        if (data.userId !== user.uid) throw new Error('No autorizado');
        if (data.status !== 'pending_review' && data.status !== 'waiting_correction') {
          throw new Error('Solo puedes cancelar canjes pendientes');
        }
        const refundCoins = data.coinCost ?? 0;
        const refundKeys = data.keyCost ?? 0;
        const userDoc = await tx.get(userRef);
        if (!userDoc.exists()) throw new Error('Usuario no encontrado');
        const userData = userDoc.data();
        tx.update(userRef, {
          coins: (userData.coins ?? 0) + refundCoins,
          campaignKeys: (userData.campaignKeys ?? 0) + refundKeys,
        });
        tx.delete(canjeRef);
      });

      setCoins((prev) => prev + (canjes.find((c) => c.id === canjeId)?.coinCost ?? 0));
      await refreshCanjes();
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cancelar canje';
      return { ok: false, error: msg };
    }
  }, [canjes, refreshCanjes]);

  const logOperatorAction = useCallback(async (action: string, details?: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await addDoc(collection(db, 'logs_operadores'), {
        operatorUid: user.uid,
        operatorName: playerName || user.email?.split('@')[0] || 'Operador',
        action,
        details: details ?? '',
        timestamp: serverTimestamp(),
      });
    } catch {}
  }, [playerName]);

  const adminApproveCanje = useCallback(async (canjeId: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'No autenticado' };
      if (userRole !== 'admin' && userRole !== 'operador') return { ok: false, error: 'Sin permisos' };
      const canjeRef = doc(db, 'canjes', canjeId);
      const approvedRef = doc(db, 'canjes_aprobadas', canjeId);
      const now = Date.now();

      const data = await runTransaction(db, async (tx) => {
        const canjeDoc = await tx.get(canjeRef);
        if (!canjeDoc.exists()) throw new Error('Canje no encontrado');
        const d = canjeDoc.data();
        if (d.status !== 'pending_review' && d.status !== 'waiting_correction') {
          throw new Error('El canje ya fue procesado');
        }
        tx.set(approvedRef, {
          ...d,
          status: 'approved',
          approvedAt: now,
          approvedBy: user.uid,
        });
        tx.delete(canjeRef);
        return d;
      });

      if (data.userId) {
        await addDoc(collection(db, 'notificaciones'), {
          userId: data.userId,
          message: '¡Tus diamantes fueron canjeados! Ve a verlos',
          createdAt: now,
          read: false,
        }).catch(() => {});

        try {
          const userRef = doc(db, 'usuarios', data.userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const fcmToken = userDoc.data()?.fcmToken;
            if (fcmToken) {
              await fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `key=913250323167`,
                },
                body: JSON.stringify({
                  to: fcmToken,
                  notification: {
                    title: '¡Canje Completado! 💎',
                    body: 'Tus diamantes han sido canjeados, entra al juego y compruébalos. Gracias por confiar en nosotros.',
                    icon: '/ic_launcher_foreground.webp',
                    click_action: '/',
                  },
                  data: {
                    type: 'canje_approved',
                    canjeId,
                    userId: data.userId,
                  },
                }),
              }).catch(() => {});
            }
          }
        } catch {}
      }
      await refreshCanjes();
      await logOperatorAction('aprobar_canje', `Canje: ${canjeId}, Recompensa: ${data.selectedReward ?? ''}`);
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al aprobar canje';
      return { ok: false, error: msg };
    }
  }, [userRole, refreshCanjes, logOperatorAction]);

  const adminMarkCorrection = useCallback(async (canjeId: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const canjeRef = doc(db, 'canjes', canjeId);
      const canjeDoc = await getDoc(canjeRef);
      if (!canjeDoc.exists()) return { ok: false, error: 'Canje no encontrado' };
      const data = canjeDoc.data();
      if (data.status !== 'pending_review') return { ok: false, error: 'El canje no está pendiente' };
      const deadline = Date.now() + CORRECTION_TIMEOUT_MS;
      await updateDoc(canjeRef, {
        status: 'waiting_correction',
        correctionDeadline: deadline,
      });
      await refreshCanjes();
      await logOperatorAction('marcar_correccion', `Canje: ${canjeId}, Player ID: ${data.playerID ?? ''}`);
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al marcar corrección';
      return { ok: false, error: msg };
    }
  }, [refreshCanjes, logOperatorAction]);

  const adminRejectCanje = useCallback(async (canjeId: string, reason: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'No autenticado' };
      if (userRole !== 'admin' && userRole !== 'operador') return { ok: false, error: 'Sin permisos' };
      const canjeRef = doc(db, 'canjes', canjeId);
      const rejectedRef = doc(db, 'canjes_rechazadas', canjeId);
      const now = Date.now();

      const data = await runTransaction(db, async (tx) => {
        const canjeDoc = await tx.get(canjeRef);
        if (!canjeDoc.exists()) throw new Error('Canje no encontrado');
        const d = canjeDoc.data();
        if (d.status !== 'pending_review' && d.status !== 'waiting_correction') {
          throw new Error('El canje ya fue procesado');
        }
        const refundCoins = d.coinCost ?? 0;
        const refundKeys = d.keyCost ?? 0;
        if (d.userId) {
          const userRef = doc(db, 'usuarios', d.userId);
          const userDoc = await tx.get(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            tx.update(userRef, {
              coins: (userData.coins ?? 0) + refundCoins,
              campaignKeys: (userData.campaignKeys ?? 0) + refundKeys,
            });
          }
        }
        tx.set(rejectedRef, {
          ...d,
          status: 'rejected',
          rejectedAt: now,
          rejectedBy: user.uid,
          rejectReason: reason,
        });
        tx.delete(canjeRef);
        return d;
      });

      if (data.userId) {
        await addDoc(collection(db, 'notificaciones'), {
          userId: data.userId,
          title: '❌ Canje Rechazado',
          message: `Tu solicitud de canje fue rechazada: ${reason}. Tus monedas y llaves fueron devueltas.`,
          type: 'canje_rejected',
          createdAt: now,
          read: false,
        }).catch(() => {});

        try {
          const userRef = doc(db, 'usuarios', data.userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const fcmToken = userDoc.data()?.fcmToken;
            if (fcmToken) {
              await fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `key=913250323167`,
                },
                body: JSON.stringify({
                  to: fcmToken,
                  notification: {
                    title: '❌ Canje Rechazado',
                    body: `Tu canje fue rechazado. Monedas y llaves devueltas. Motivo: ${reason}`,
                    icon: '/ic_launcher_foreground.webp',
                    click_action: '/',
                  },
                  data: { type: 'canje_rejected', canjeId },
                }),
              }).catch(() => {});
            }
          }
        } catch {}
      }
      await refreshCanjes();
      await logOperatorAction('rechazar_canje', `Canje: ${canjeId}, Motivo: ${reason}`);
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al rechazar canje';
      return { ok: false, error: msg };
    }
  }, [userRole, refreshCanjes, logOperatorAction]);

  useEffect(() => {
    const interval = setInterval(() => {
      canjes.forEach(async (c) => {
        if (c.status === 'waiting_correction' && c.correctionDeadline && Date.now() >= c.correctionDeadline) {
          try {
            const user = auth.currentUser;
            if (!user) return;
            const canjeRef = doc(db, 'canjes', c.id);
            const rejectedRef = doc(db, 'canjes_rechazadas', c.id);
            const now = Date.now();

            await runTransaction(db, async (tx) => {
              const canjeDoc = await tx.get(canjeRef);
              if (!canjeDoc.exists()) return;
              const data = canjeDoc.data();
              if (data.status !== 'waiting_correction') return;
              const refundCoins = data.coinCost ?? 0;
              const refundKeys = data.keyCost ?? 0;
              if (data.userId) {
                const userRef = doc(db, 'usuarios', data.userId);
                const userDoc = await tx.get(userRef);
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  tx.update(userRef, {
                    coins: (userData.coins ?? 0) + refundCoins,
                    campaignKeys: (userData.campaignKeys ?? 0) + refundKeys,
                  });
                }
              }
              tx.set(rejectedRef, {
                ...data,
                status: 'rejected',
                rejectedAt: now,
                rejectReason: 'Rechazado por tiempo expirado (2h)',
              });
              tx.delete(canjeRef);
            });
            await refreshCanjes();
          } catch {}
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [canjes, refreshCanjes]);

  const [adminCanjesList, setAdminCanjesList] = useState<CanjeRequest[]>([]);
  const [adminApprovedList, setAdminApprovedList] = useState<CanjeRequest[]>([]);
  const [adminCanjesCounts, setAdminCanjesCounts] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [adminCanjesPage, setAdminCanjesPage] = useState(0);
  const adminCanjesPageSize = 100;

  const refreshAdminCanjes = useCallback(async () => {
    return Promise.resolve();
  }, []);

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'operador') return;
    try {
      const pendingQ = query(
        collection(db, 'canjes'),
        where('status', 'in', ['pending_review', 'waiting_correction'])
      );
      const unsubPending = onSnapshot(pendingQ, (snap) => {
        const pendingList: CanjeRequest[] = [];
        snap.forEach((d) => {
          const data = d.data();
          pendingList.push({
            id: d.id, userId: data.userId ?? '', userName: data.userName ?? '',
            gameId: data.gameId ?? 'free_fire', selectedReward: data.selectedReward ?? '',
            coinCost: data.coinCost ?? 0, keyCost: data.keyCost ?? 0,
            estimatedUsdValue: data.estimatedUsdValue ?? 0, status: data.status ?? 'pending_review',
            createdAt: data.createdAt ?? 0, queuePosition: data.queuePosition ?? 0,
            playerID: data.playerID ?? '', nickname: data.nickname ?? '',
            correctionDeadline: data.correctionDeadline ?? null,
          });
        });
        pendingList.sort((a, b) => a.createdAt - b.createdAt);
        pendingList.forEach((c, i) => { c.queuePosition = i + 1; });
        setAdminCanjesList(pendingList);
      }, () => {});

      const unsubApproved = onSnapshot(collection(db, 'canjes_aprobadas'), (snap) => {
        const approvedList: CanjeRequest[] = [];
        snap.forEach((d) => {
          const data = d.data();
          approvedList.push({
            id: d.id, userId: data.userId ?? '', userName: data.userName ?? '',
            gameId: data.gameId ?? 'free_fire', selectedReward: data.selectedReward ?? '',
            coinCost: data.coinCost ?? 0, keyCost: data.keyCost ?? 0,
            estimatedUsdValue: data.estimatedUsdValue ?? 0, status: 'approved',
            createdAt: data.createdAt ?? 0, queuePosition: 0,
            playerID: data.playerID ?? '', nickname: data.nickname ?? '',
            approvedAt: data.approvedAt ?? null,
          });
        });
        approvedList.sort((a, b) => (b.approvedAt ?? 0) - (a.approvedAt ?? 0));
        setAdminApprovedList(approvedList);
        setAdminCanjesCounts((prev) => ({
          ...prev,
          approved: approvedList.length,
          pending: adminCanjesList.length,
        }));
      }, () => {});

      return () => {
        unsubPending();
        unsubApproved();
      };
    } catch { return; }
  }, [userRole]);

  const canjesPagination = {
    page: adminCanjesPage,
    totalPages: Math.max(1, Math.ceil(adminCanjesList.length / adminCanjesPageSize)),
    total: adminCanjesCounts.total,
    approved: adminCanjesCounts.approved,
    pending: adminCanjesCounts.pending,
    rejected: adminCanjesCounts.rejected,
  };

  const fetchGlobalStatsRef = useRef<(() => Promise<void>) | null>(null);

  const refreshAdminStats = useCallback(async () => {
    if (fetchGlobalStatsRef.current) {
      await fetchGlobalStatsRef.current();
    }
  }, []);

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'operador') return;
    const fetchGlobalStats = async () => {
      try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const totalSnap = await getDocsCount(collection(db, 'usuarios'));
        const active1h = await getDocsCount(query(collection(db, 'usuarios'), where('lastActive', '>=', oneHourAgo)));
        const active24h = await getDocsCount(query(collection(db, 'usuarios'), where('lastActive', '>=', oneDayAgo)));
        const active7d = await getDocsCount(query(collection(db, 'usuarios'), where('lastActive', '>=', sevenDaysAgo)));
        const active30d = await getDocsCount(query(collection(db, 'usuarios'), where('lastActive', '>=', thirtyDaysAgo)));
        const inactive7d = totalSnap - active7d;

        const coinSnap = await getDocs(query(collection(db, 'usuarios'), orderBy('coins', 'desc'), limit(100)));
        let totalCoins = 0, activeCoins = 0, inactiveCoins = 0;
        const nearClaim: AdminUserInfo[] = [];
        const returnedUsers: AdminUserInfo[] = [];
        const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        coinSnap.forEach((d) => {
          const data = d.data();
          const userCoins = data.coins ?? 0;
          totalCoins += userCoins;
          const lastLoginRaw = data.lastLogin ?? data.lastActive;
          let lastLoginDate: Date;
          if (lastLoginRaw && typeof lastLoginRaw.toDate === 'function') lastLoginDate = lastLoginRaw.toDate();
          else if (lastLoginRaw) lastLoginDate = new Date(lastLoginRaw);
          else lastLoginDate = new Date(0);
          const isInactive = lastLoginDate < sevenDaysAgo;
          if (isInactive) inactiveCoins += userCoins; else activeCoins += userCoins;
          if (userCoins >= NEAR_CLAIM_THRESHOLD) {
            nearClaim.push({
              uid: d.id, nombre: data.nombre ?? data.email ?? 'Unknown', email: data.email ?? '',
              coins: userCoins, lastLogin: lastLoginDate.toISOString(), inactive: isInactive,
              totalRuns: data.totalRuns ?? 0, bestScore: data.bestScore ?? 0, rol: data.rol ?? 'user',
              puntos: data.puntos ?? 0, puntos_semanales: data.puntos_semanales ?? 0,
              puntos_espacio: data.puntos_espacio ?? 0, puntos_zombies: data.puntos_zombies ?? 0,
              tiempo_jugado_min: data.tiempo_jugado_min ?? 0, vip: data.vip ?? false,
              diamondHistory: data.diamondHistory ?? 0, createdAt: data.createdAt ?? null,
              adsWatched: data.adsWatched ?? 0, bitlabsEarnings: data.bitlabsEarnings ?? 0,
              campaignKeys: data.campaignKeys ?? 0,
            });
          }
          if (lastLoginDate < fifteenDaysAgo && (data.totalRuns ?? 0) < RETURNED_USER_MIN_GAMES) {
            returnedUsers.push({
              uid: d.id, nombre: data.nombre ?? data.email ?? 'Unknown', email: data.email ?? '',
              coins: userCoins, lastLogin: lastLoginDate.toISOString(), inactive: true,
              totalRuns: data.totalRuns ?? 0, bestScore: data.bestScore ?? 0, rol: data.rol ?? 'user',
            });
          }
        });
        nearClaim.sort((a, b) => b.coins - a.coins);
        const reservedAmount = (activeCoins / COINS_PER_USD) * SOLES_PER_USD;
        const availableAmount = (inactiveCoins / COINS_PER_USD) * SOLES_PER_USD;
        const nearClaimSummary: NearClaimSummary = {
          count: nearClaim.length,
          totalEstimatedCost: nearClaim.reduce((sum, u) => sum + (u.coins / COINS_PER_USD) * SOLES_PER_USD, 0),
          totalEstimatedRevenue: nearClaim.reduce((sum, u) => sum + (u.bitlabsEarnings ?? 0) + ((u.adsWatched ?? 0) * 0.001), 0),
          totalNet: 0,
        };
        nearClaimSummary.totalNet = nearClaimSummary.totalEstimatedRevenue - nearClaimSummary.totalEstimatedCost;
        setAdminUserStats({
          totalUsers: totalSnap, totalCoins, activeCoins, inactiveCoins,
          reservedAmount, availableAmount, nearClaimUsers: nearClaim,
          activeUsers: active7d, inactiveUsers: inactive7d,
          activeUsers1h: active1h, activeUsers24h: active24h, activeUsers30d: active30d,
          returnedUsers, nearClaimSummary, totalExchanges: 0,
        });
        if (reservedAmount > 0) {
          const ratio = activeCoins / (totalCoins || 1);
          if (ratio > 0.8) setTransactionLight('green');
          else if (ratio > 0.5) setTransactionLight('yellow');
          else setTransactionLight('red');
        }
      } catch {}
    };
    fetchGlobalStatsRef.current = fetchGlobalStats;
    fetchGlobalStats();
    const interval = setInterval(fetchGlobalStats, 60000);
    return () => clearInterval(interval);
  }, [userRole]);

  const searchUsers = useCallback(async (searchQuery: string) => {
    try {
      userSearchQueryRef.current = searchQuery;
      userSearchCursorRef.current = 0;
      if (!searchQuery.trim()) {
        setUserSearchResults([]);
        setHasMoreUsers(false);
        return;
      }
      const lower = searchQuery.toLowerCase();
      const snap = await getDocs(query(
        collection(db, 'usuarios'),
        where('nombre', '>=', searchQuery),
        where('nombre', '<=', searchQuery + '\uf8ff'),
        limit(15)
      ));
      const results: AdminUserInfo[] = [];
      snap.forEach((d) => {
        const data = d.data();
        results.push({
          uid: d.id,
          nombre: data.nombre ?? 'Unknown',
          email: data.email ?? '',
          coins: data.coins ?? 0,
          lastLogin: data.lastLogin?.toDate?.()?.toISOString?.() ?? '',
          inactive: false,
          totalRuns: data.totalRuns ?? 0,
          bestScore: data.bestScore ?? 0,
          rol: data.rol ?? 'user',
          puntos: data.puntos ?? 0,
          puntos_semanales: data.puntos_semanales ?? 0,
          puntos_espacio: data.puntos_espacio ?? 0,
          puntos_zombies: data.puntos_zombies ?? 0,
          tiempo_jugado_min: data.tiempo_jugado_min ?? 0,
          vip: data.vip ?? false,
          diamondHistory: data.diamondHistory ?? 0,
          createdAt: data.createdAt ?? null,
        });
      });
      if (results.length < 15) {
        const emailSnap = await getDocs(query(
          collection(db, 'usuarios'),
          where('email', '>=', lower),
          where('email', '<=', lower + '\uf8ff'),
          limit(15)
        ));
        emailSnap.forEach((d) => {
          if (!results.find((r) => r.uid === d.id)) {
            const data = d.data();
            results.push({
              uid: d.id,
              nombre: data.nombre ?? 'Unknown',
              email: data.email ?? '',
              coins: data.coins ?? 0,
              lastLogin: data.lastLogin?.toDate?.()?.toISOString?.() ?? '',
              inactive: false,
              totalRuns: data.totalRuns ?? 0,
              bestScore: data.bestScore ?? 0,
              rol: data.rol ?? 'user',
              puntos: data.puntos ?? 0,
              puntos_semanales: data.puntos_semanales ?? 0,
              puntos_espacio: data.puntos_espacio ?? 0,
              puntos_zombies: data.puntos_zombies ?? 0,
              tiempo_jugado_min: data.tiempo_jugado_min ?? 0,
              vip: data.vip ?? false,
              diamondHistory: data.diamondHistory ?? 0,
              createdAt: data.createdAt ?? null,
            });
          }
        });
      }
      setUserSearchResults(results);
      setHasMoreUsers(results.length === 15);
      userSearchCursorRef.current = 15;
    } catch {
      setUserSearchResults([]);
      setHasMoreUsers(false);
    }
  }, []);

  const loadMoreUsers = useCallback(async () => {
    try {
      const cursor = userSearchCursorRef.current;
      if (cursor === 0) return;
      const snap = await getDocs(query(collection(db, 'usuarios'), orderBy('coins', 'desc'), limit(50 + cursor)));
      const newUsers: Array<{
        uid: string; nombre: string; email: string; coins: number;
        puntos: number; vip: boolean; playerID: string; nickname: string;
        tiempo_jugado_min: number; tiempo_app_min: number; createdAt: unknown;
        lastActive: unknown; banned: boolean; currentRequest: string;
      }> = [];
      snap.forEach((d) => {
        const data = d.data();
        newUsers.push({
          uid: d.id,
          nombre: data.nombre ?? data.email?.split('@')[0] ?? 'Jugador',
          email: data.email ?? '',
          coins: data.coins ?? 0,
          puntos: (data.puntos_espacio ?? 0) + (data.puntos_zombies ?? 0) + (data.puntos_semanales ?? 0),
          vip: data.vip ?? false,
          playerID: data.playerID ?? '',
          nickname: data.nickname ?? data.nombre ?? '',
          tiempo_jugado_min: data.tiempo_jugado_min ?? 0,
          tiempo_app_min: data.tiempo_app_min ?? 0,
          createdAt: data.createdAt ?? null,
          lastActive: data.lastActive ?? null,
          banned: data.banned ?? false,
          currentRequest: data.currentRequest ?? '',
        });
      });
      setAllUsersList(newUsers);
      setHasMoreUsers(snap.size === 50 + cursor);
      userSearchCursorRef.current = 50 + cursor;
    } catch {}
  }, []);

  const clearUserSearch = useCallback(() => {
    setUserSearchResults([]);
    setHasMoreUsers(false);
    userSearchQueryRef.current = '';
    userSearchCursorRef.current = 0;
  }, []);

  const checkDeviceBan = useCallback(async () => {
    try {
      let deviceId = 'unknown';
      if (typeof window !== 'undefined') {
        deviceId = localStorage.getItem('deviceId') || (() => {
          const id = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
          localStorage.setItem('deviceId', id);
          return id;
        })();
      }
      const snap = await getDocs(query(collection(db, 'blacklist_devices'), where('deviceId', '==', deviceId)));
      if (!snap.empty) {
        setIsDeviceBanned(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    checkDeviceBan();
  }, [checkDeviceBan]);

  const reportSuspiciousActivity = useCallback((type: string, details: string) => {
    try {
      const user = auth.currentUser;
      addDoc(collection(db, 'activity_suspicious'), {
        userId: user?.uid ?? 'unknown',
        email: user?.email ?? email ?? 'unknown',
        type,
        details,
        deviceId: typeof window !== 'undefined' ? localStorage.getItem('deviceId') ?? 'unknown' : 'unknown',
        timestamp: serverTimestamp(),
      }).catch(() => {});
    } catch {}
  }, [email]);

  const setDelegateWork = useCallback(async (v: boolean) => {
    setDelegateWorkState(v);
    try {
      await setDoc(doc(db, 'config', 'admin'), { delegateWork: v }, { merge: true });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      getDoc(doc(db, 'config', 'admin')).then((snap) => {
        if (snap.exists()) {
          setDelegateWorkState(snap.data()?.delegateWork ?? false);
        }
      }).catch(() => {});
    } catch {}
  }, []);

  const startOperatorTurn = useCallback(async (initialBalance: number, receiptFile?: Blob): Promise<{ ok: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'No autenticado' };
      const turnData = {
        operatorId: user.uid,
        operatorName: user.email ?? 'Operator',
        startTime: serverTimestamp(),
        initialBalance,
        currentBalance: initialBalance,
        prizesPaid: 0,
        status: 'activo',
      };
      const turnRef = await addDoc(collection(db, 'operator_turns'), turnData);
      setOperatorTurn({
        id: turnRef.id,
        ...turnData,
        startTime: new Date().toISOString(),
        status: 'activo',
      });
      setOperatorOnLunch(false);
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar turno';
      return { ok: false, error: msg };
    }
  }, []);

  const endOperatorTurn = useCallback(async (checkoutFile?: Blob): Promise<{ ok: boolean; error?: string }> => {
    try {
      if (!operatorTurn) return { ok: false, error: 'No hay turno activo' };
      await updateDoc(doc(db, 'operator_turns', operatorTurn.id), {
        endTime: serverTimestamp(),
        status: 'cerrado',
      });
      setOperatorTurn(null);
      setOperatorOnLunch(false);
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cerrar turno';
      return { ok: false, error: msg };
    }
  }, [operatorTurn]);

  useEffect(() => {
    if (!operatorTurn) return;
    const startMs = operatorTurn.startTime instanceof Timestamp
      ? operatorTurn.startTime.toDate().getTime()
      : new Date(operatorTurn.startTime).getTime();
    const lunchBreakMs = OPERATOR_LUNCH_BREAK_HOURS * 60 * 60 * 1000;
    const checkLunch = () => {
      if (Date.now() - startMs >= lunchBreakMs) {
        setOperatorOnLunch(true);
      }
    };
    const interval = setInterval(checkLunch, 60000);
    return () => clearInterval(interval);
  }, [operatorTurn]);

  const refreshInfluencerInfo = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      if (!userDoc.exists()) return;
      const data = userDoc.data();
      const totalRuns = data.totalRuns ?? 0;
      const bestScore = data.bestScore ?? 0;
      const userCoins = data.coins ?? 0;
      let rank: 'bronce' | 'plata' | 'oro' = 'bronce';
      if (bestScore >= 20000) rank = 'oro';
      else if (bestScore >= 10000) rank = 'plata';

      const weekStart = getStartOfWeek();
      const recentSnap = await getDocs(query(
        collection(db, 'scores_weekly'),
        where('uid', '==', user.uid),
        where('date', '>=', weekStart),
      ));
      let recentGames = 0;
      recentSnap.forEach(() => recentGames++);

      const meetsRuns = totalRuns >= INFLUENCER_MIN_RUNS;
      const meetsScore = bestScore >= INFLUENCER_MIN_SCORE;
      const meetsBalance = userCoins >= INFLUENCER_MIN_BALANCE;
      const meetsRecentGames = recentGames >= INFLUENCER_RECENT_GAMES;
      const canWithdraw = meetsRuns && meetsScore && meetsBalance && meetsRecentGames && userCoins >= INFLUENCER_MIN_WITHDRAW;

      setInfluencerInfo({
        uid: user.uid,
        nombre: data.nombre ?? user.email?.split('@')[0] ?? 'Player',
        email: data.email ?? '',
        coins: userCoins,
        totalRuns,
        bestScore,
        rank,
        canWithdraw,
        recentGames,
      });
    } catch {}
  }, []);

  const requestInfluencerWithdraw = useCallback(async (amount: number): Promise<{ ok: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'No autenticado' };
      if (amount < INFLUENCER_MIN_WITHDRAW) return { ok: false, error: `Minimo ${INFLUENCER_MIN_WITHDRAW} diamantes.` };
      if (!influencerInfo) return { ok: false, error: 'Info no cargada' };
      if (!influencerInfo.canWithdraw) return { ok: false, error: 'No cumples los requisitos para retiro.' };
      if (influencerInfo.coins < amount) return { ok: false, error: 'Saldo insuficiente.' };

      const batch = writeBatch(db);
      const userRef = doc(db, 'usuarios', user.uid);
      batch.update(userRef, { coins: influencerInfo.coins - amount });
      const withdrawRef = doc(collection(db, 'retiros_influencers'));
      batch.set(withdrawRef, {
        uid: user.uid,
        amount,
        fecha: serverTimestamp(),
        estado: 'pendiente',
        rank: influencerInfo.rank,
      });
      await batch.commit();
      await refreshInfluencerInfo();
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al solicitar retiro';
      return { ok: false, error: msg };
    }
  }, [influencerInfo, refreshInfluencerInfo]);

  const [adminIncomeRecords, setAdminIncomeRecords] = useState<IncomeRecord[]>([]);

  const refreshAdminIncomeRecords = useCallback(async (year: number, month: number) => {
    try {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 1);
      const snap = await getDocs(query(
        collection(db, 'admin_income'),
        where('date', '>=', start),
        where('date', '<', end),
        orderBy('date', 'desc'),
      ));
      const records: IncomeRecord[] = [];
      snap.forEach((d) => {
        const data = d.data();
        const rawDate = data.date;
        let dateStr = '';
        if (rawDate && typeof rawDate.toDate === 'function') dateStr = rawDate.toDate().toISOString();
        else if (rawDate instanceof Date) dateStr = rawDate.toISOString();
        else if (rawDate) dateStr = new Date(rawDate).toISOString();
        else if (data.createdAt && typeof data.createdAt.toDate === 'function') dateStr = data.createdAt.toDate().toISOString();
        else dateStr = new Date().toISOString();
        // Support old records that only have amount (no amountPEN)
        const amountPEN = data.amountPEN ?? (typeof data.amount === 'number' ? data.amount : 0);
        records.push({
          id: d.id,
          amountPEN,
          note: data.note ?? '',
          date: dateStr,
        });
      });
      setAdminIncomeRecords(records);
    } catch {
      // Fallback: query without date filter (in case index is missing)
      try {
        const snap = await getDocs(query(collection(db, 'admin_income'), orderBy('date', 'desc'), limit(200)));
        const records: IncomeRecord[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const rawDate = data.date;
          let dateStr = '';
          if (rawDate && typeof rawDate.toDate === 'function') dateStr = rawDate.toDate().toISOString();
          else if (rawDate instanceof Date) dateStr = rawDate.toISOString();
          else if (rawDate) dateStr = new Date(rawDate).toISOString();
          else if (data.createdAt && typeof data.createdAt.toDate === 'function') dateStr = data.createdAt.toDate().toISOString();
          else dateStr = new Date().toISOString();
          const recordDate = new Date(dateStr);
          if (recordDate.getFullYear() === year && recordDate.getMonth() === month) {
            const amountPEN = data.amountPEN ?? (typeof data.amount === 'number' ? data.amount : 0);
            records.push({ id: d.id, amountPEN, note: data.note ?? '', date: dateStr });
          }
        });
        setAdminIncomeRecords(records);
      } catch {}
    }
  }, []);

  const adminManualIncome = useCallback(async (params: {
    amount: number;
    date: string;
    note?: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    try {
      if (userRole !== 'admin' && userRole !== 'operador') return { ok: false, error: 'Sin permisos' };
      await addDoc(collection(db, 'admin_income'), {
        amount: params.amount,
        amountPEN: params.amount,
        currency: 'PEN',
        note: params.note ?? '',
        date: Timestamp.fromDate(new Date(params.date)),
        type: 'manual',
        createdAt: serverTimestamp(),
      });
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar ingreso';
      return { ok: false, error: msg };
    }
  }, [userRole]);

  const adminDeleteIncome = useCallback(async (id: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      await deleteDoc(doc(db, 'admin_income', id));
      setAdminIncomeRecords((prev) => prev.filter((r) => r.id !== id));
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar ingreso';
      return { ok: false, error: msg };
    }
  }, []);

  const adminSetExchangeLimit = useCallback(async (limit: number): Promise<{ ok: boolean; error?: string }> => {
    try {
      if (userRole !== 'admin' && userRole !== 'operador') return { ok: false, error: 'Sin permisos' };
      await setDoc(doc(db, 'config', 'exchange'), { maxDaily: limit }, { merge: true });
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar limite';
      return { ok: false, error: msg };
    }
  }, [userRole]);

  const adminBanUser = useCallback(async (uid: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      if (userRole !== 'admin') return { ok: false, error: 'Solo admin puede banear' };
      await updateDoc(doc(db, 'usuarios', uid), { banned: true, bannedDate: serverTimestamp() });
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al banear usuario';
      return { ok: false, error: msg };
    }
  }, [userRole]);

  const adminPanicButton = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      if (userRole !== 'admin') return { ok: false, error: 'Solo admin puede activar panico' };
      await setDoc(doc(db, 'config', 'global'), { panicMode: true, panicTime: serverTimestamp() }, { merge: true });
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al activar panico';
      return { ok: false, error: msg };
    }
  }, [userRole]);

  useEffect(() => {
    if (!loggedIn || !auth.currentUser) return;
    const userUid = auth.currentUser.uid;
    const checkRank = () => {
      const rankings = [spaceRanking, zombieRanking, weeklyRanking];
      let bestRank: number | null = null;
      for (const ranking of rankings) {
        const idx = ranking.findIndex((e) => e.uid === userUid || e.name === playerName);
        if (idx >= 0) {
          if (bestRank === null || idx + 1 < bestRank) bestRank = idx + 1;
        }
      }
      setCurrentUserRank(bestRank);
    };
    checkRank();

    const computeDynamicRank = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'usuarios', userUid));
        if (!userDoc.exists()) {
          setCurrentUserRank(null);
          return;
        }
        const userData = userDoc.data();
        const userSpace = userData.puntos_espacio ?? 0;
        const userZombie = userData.puntos_zombies ?? 0;
        const userWeekly = userData.puntos_semanales ?? 0;

        if (userSpace <= 0 && userZombie <= 0 && userWeekly <= 0) {
          setCurrentUserRank(null);
          setCurrentUserScore(0);
          return;
        }

        const bestScore = Math.max(userSpace, userZombie, userWeekly);
        setCurrentUserScore(bestScore);

        let bestRank: number | null = null;

        if (userSpace > 0) {
          const spaceQ = query(collection(db, 'usuarios'), where('puntos_espacio', '>', userSpace));
          const spaceSnap = await getDocs(spaceQ);
          const rank = spaceSnap.size + 1;
          if (bestRank === null || rank < bestRank) bestRank = rank;
        }
        if (userZombie > 0) {
          const zombieQ = query(collection(db, 'usuarios'), where('puntos_zombies', '>', userZombie));
          const zombieSnap = await getDocs(zombieQ);
          const rank = zombieSnap.size + 1;
          if (bestRank === null || rank < bestRank) bestRank = rank;
        }
        if (userWeekly > 0) {
          const weeklyQ = query(collection(db, 'usuarios'), where('puntos_semanales', '>', userWeekly));
          const weeklySnap = await getDocs(weeklyQ);
          const rank = weeklySnap.size + 1;
          if (bestRank === null || rank < bestRank) bestRank = rank;
        }

        setCurrentUserRank(bestRank);
      } catch {}
    };
    computeDynamicRank();
  }, [spaceRanking, zombieRanking, weeklyRanking, loggedIn, playerName]);

  // ============================================================
  // CREATOR PROGRAM
  // ============================================================

  const refreshCreatorApplication = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDocs(query(
        collection(db, 'creator_applications'),
        where('uid', '==', user.uid),
        limit(1)
      ));
      if (snap.empty) { setCreatorApplication(null); return; }
      const d = snap.docs[0];
      const data = d.data();
      setCreatorApplication({
        id: d.id,
        uid: data.uid ?? '',
        channelName: data.channelName ?? '',
        platform: data.platform ?? 'tiktok',
        profileUrl: data.profileUrl ?? '',
        videoUrl: data.videoUrl ?? '',
        requestedCode: data.requestedCode ?? '',
        status: data.status ?? 'pending',
        createdAt: data.createdAt ?? 0,
        reviewedAt: data.reviewedAt ?? null,
        reviewedBy: data.reviewedBy ?? null,
        rejectReason: data.rejectReason ?? '',
      });
    } catch {}
  }, []);

  const refreshCreatorReferralCode = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      if (userDoc.exists()) {
        const code = userDoc.data()?.referredByCode ?? null;
        setCreatorReferralCode(code);
      }
    } catch {}
  }, []);

  const submitCreatorApplication = useCallback(async (
    channelName: string,
    platform: Platform,
    profileUrl: string,
    videoUrl: string,
    requestedCode: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'No autenticado' };
      if (channelName.trim().length < 2) return { ok: false, error: 'Nombre demasiado corto' };
      if (!isValidUrl(profileUrl)) return { ok: false, error: 'URL de perfil invalida' };
      if (!isValidUrl(videoUrl)) return { ok: false, error: 'URL de video invalida' };
      const codeCheck = isValidCode(requestedCode);
      if (!codeCheck.ok) return { ok: false, error: codeCheck.error };
      const code = normalizeCode(requestedCode);

      // Check for existing application
      const existingSnap = await getDocs(query(
        collection(db, 'creator_applications'),
        where('uid', '==', user.uid),
        limit(1)
      ));
      if (!existingSnap.empty) {
        const existing = existingSnap.docs[0].data();
        if (existing.status === 'pending' || existing.status === 'approved') {
          return { ok: false, error: 'Ya tienes una solicitud activa' };
        }
      }

      // Check code uniqueness across active codes and pending applications
      const codeSnap = await getDocs(query(
        collection(db, 'creator_codes'),
        where('code', '==', code),
        limit(1)
      ));
      if (!codeSnap.empty) return { ok: false, error: 'Codigo no disponible' };

      const pendingCodeSnap = await getDocs(query(
        collection(db, 'creator_applications'),
        where('requestedCode', '==', code),
        where('status', '==', 'pending'),
        limit(1)
      ));
      if (!pendingCodeSnap.empty) return { ok: false, error: 'Codigo no disponible' };

      const newRef = doc(collection(db, 'creator_applications'));
      await setDoc(newRef, {
        id: newRef.id,
        uid: user.uid,
        channelName: channelName.trim(),
        platform,
        profileUrl: profileUrl.trim(),
        videoUrl: videoUrl.trim(),
        requestedCode: code,
        status: 'pending',
        createdAt: Date.now(),
      });
      await refreshCreatorApplication();
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al solicitar';
      return { ok: false, error: msg };
    }
  }, [refreshCreatorApplication]);

  const applyReferralCode = useCallback(async (rawCode: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'No autenticado' };
      const code = normalizeCode(rawCode);
      if (code.length < CODE_MIN_LENGTH) return { ok: false, error: 'Codigo demasiado corto' };

      const userRef = doc(db, 'usuarios', user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return { ok: false, error: 'Usuario no encontrado' };
      const userData = userDoc.data();
      if (userData.referredByCode) return { ok: false, error: 'Ya apoyas a un creador' };
      if (userData.banned) return { ok: false, error: 'Cuenta suspendida' };

      // Find the creator code
      const codeSnap = await getDocs(query(
        collection(db, 'creator_codes'),
        where('code', '==', code),
        limit(1)
      ));
      if (codeSnap.empty) return { ok: false, error: 'Codigo no encontrado' };
      const codeDoc = codeSnap.docs[0];
      const codeData = codeDoc.data();
      if (codeData.status !== 'active') return { ok: false, error: 'Codigo no activo' };
      if (codeData.uid === user.uid) return { ok: false, error: 'No puedes usar tu propio codigo' };

      const referralRef = doc(collection(db, 'creator_referrals'));
      const now = Date.now();

      await runTransaction(db, async (tx) => {
        const freshUserDoc = await tx.get(userRef);
        if (!freshUserDoc.exists()) throw new Error('Usuario no encontrado');
        const freshUserData = freshUserDoc.data();
        if (freshUserData.referredByCode) throw new Error('Ya apoyas a un creador');

        // Credit player 50 coins
        tx.update(userRef, {
          coins: (freshUserData.coins ?? 0) + PLAYER_REFERRAL_REWARD,
          referredByCode: code,
        });

        // Create referral record — save baseline play time to count from referral moment
        tx.set(referralRef, {
          id: referralRef.id,
          code,
          creatorUid: codeData.uid,
          creatorCodeDocId: codeDoc.id,
          referredUid: user.uid,
          status: 'pendingQualification',
          playerRewardPaid: true,
          creatorRewardPaid: false,
          qualifiedAt: null,
          createdAt: now,
          playTimeAtReferral: freshUserData.tiempo_jugado_min ?? 0,
          playTimeMin: 0,
          activeDays: [],
        });

        // Increment creator code counters
        const creatorCodeRef = doc(db, 'creator_codes', codeDoc.id);
        tx.update(creatorCodeRef, {
          totalReferrals: (codeData.totalReferrals ?? 0) + 1,
          pendingQualification: (codeData.pendingQualification ?? 0) + 1,
        });
      });

      setCoins((prev) => prev + PLAYER_REFERRAL_REWARD);
      setCreatorReferralCode(code);
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al aplicar codigo';
      return { ok: false, error: msg };
    }
  }, []);

  const checkAndQualifyReferral = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'usuarios', user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return;
      const userData = userDoc.data();
      if (userData.banned) return;
      const code = userData.referredByCode;
      if (!code) return;

      // Find the referral record for this user
      const refSnap = await getDocs(query(
        collection(db, 'creator_referrals'),
        where('referredUid', '==', user.uid),
        limit(1)
      ));
      if (refSnap.empty) return;
      const refDoc = refSnap.docs[0];
      const refData = refDoc.data();
      if (refData.creatorRewardPaid) return; // Already paid

      // Calculate play time AFTER the referral was applied
      const baseline = refData.playTimeAtReferral ?? 0;
      const playTimeAfterReferral = (userData.tiempo_jugado_min ?? 0) - baseline;
      if (playTimeAfterReferral < QUALIFY_MIN_MINUTES) return;

      // activeDays only contains days after the referral was created (starts empty)
      const activeDays: string[] = refData.activeDays ?? [];
      const todayKey = getDayKey();
      let daysChanged = false;
      if (!activeDays.includes(todayKey)) {
        activeDays.push(todayKey);
        daysChanged = true;
      }
      if (activeDays.length < QUALIFY_MIN_DAYS) {
        // Just update days if needed
        if (daysChanged) {
          await updateDoc(refDoc.ref, { activeDays });
        }
        return;
      }

      // Qualified! Pay creator in a transaction
      // Query for the creator code document by code string (document ID is not the code)
      const creatorCodeSnap = await getDocs(query(
        collection(db, 'creator_codes'),
        where('code', '==', code),
        limit(1)
      ));
      if (creatorCodeSnap.empty) return;
      const creatorCodeRef = creatorCodeSnap.docs[0].ref;
      const creatorRef = doc(db, 'usuarios', refData.creatorUid);
      const now = Date.now();

      await runTransaction(db, async (tx) => {
        const freshRefDoc = await tx.get(refDoc.ref);
        if (!freshRefDoc.exists()) return;
        const freshRefData = freshRefDoc.data();
        if (freshRefData.creatorRewardPaid) return; // Double-check

        const freshCodeDoc = await tx.get(creatorCodeRef);
        if (!freshCodeDoc.exists()) return;
        const freshCodeData = freshCodeDoc.data();

        const freshCreatorDoc = await tx.get(creatorRef);
        if (!freshCreatorDoc.exists()) return;
        const freshCreatorData = freshCreatorDoc.data();

        // Pay creator
        tx.update(creatorRef, {
          coins: (freshCreatorData.coins ?? 0) + CREATOR_REFERRAL_REWARD,
        });

        // Update referral record
        tx.update(refDoc.ref, {
          status: 'qualified',
          creatorRewardPaid: true,
          qualifiedAt: now,
          activeDays,
        });

        // Update creator code counters
        const monthKey = getMonthKey(now);
        const qualifiedThisMonth = (freshCodeData.qualifiedThisMonth ?? 0) + 1;
        tx.update(creatorCodeRef, {
          qualified: (freshCodeData.qualified ?? 0) + 1,
          pendingQualification: Math.max(0, (freshCodeData.pendingQualification ?? 1) - 1),
          coinsEarned: (freshCodeData.coinsEarned ?? 0) + CREATOR_REFERRAL_REWARD,
          qualifiedThisMonth,
          [`qualifiedByMonth.${monthKey}`]: qualifiedThisMonth,
        });
      });

      // Notify creator
      try {
        await addDoc(collection(db, 'notificaciones'), {
          userId: refData.creatorUid,
          title: '🔥 ¡Nuevo jugador calificado!',
          message: `Ganaste ${CREATOR_REFERRAL_REWARD} monedas gracias a tu codigo ${code}.`,
          type: 'creator_referral_qualified',
          createdAt: now,
          read: false,
        }).catch(() => {});
      } catch {}
    } catch {}
  }, []);

  useEffect(() => {
    checkAndQualifyRefRef.current = checkAndQualifyReferral;
  }, [checkAndQualifyReferral]);

  const refreshCreatorStats = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const codeSnap = await getDocs(query(
        collection(db, 'creator_codes'),
        where('uid', '==', user.uid),
        limit(1)
      ));
      if (codeSnap.empty) { setCreatorStats(null); return; }
      const data = codeSnap.docs[0].data();
      setCreatorStats({
        total: data.totalReferrals ?? 0,
        pending: data.pendingQualification ?? 0,
        qualified: data.qualified ?? 0,
        coinsEarned: data.coinsEarned ?? 0,
      });
    } catch {}
  }, []);

  const refreshCreatorRanking = useCallback(async () => {
    try {
      const snap = await getDocs(query(
        collection(db, 'creator_codes'),
        where('status', '==', 'active'),
        orderBy('qualifiedThisMonth', 'desc'),
        limit(10)
      ));
      const list: Array<{ code: string; channelName: string; qualified: number; platform: Platform }> = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          code: data.code ?? '',
          channelName: data.channelName ?? '',
          qualified: data.qualifiedThisMonth ?? 0,
          platform: data.platform ?? 'tiktok',
        });
      });
      setCreatorRanking(list);
    } catch {
      // Fallback without orderBy if index missing
      try {
        const snap = await getDocs(query(
          collection(db, 'creator_codes'),
          where('status', '==', 'active'),
          limit(10)
        ));
        const list: Array<{ code: string; channelName: string; qualified: number; platform: Platform }> = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            code: data.code ?? '',
            channelName: data.channelName ?? '',
            qualified: data.qualifiedThisMonth ?? 0,
            platform: data.platform ?? 'tiktok',
          });
        });
        list.sort((a, b) => b.qualified - a.qualified);
        setCreatorRanking(list);
      } catch {}
    }
  }, []);

  // --- Admin creator functions ---

  const refreshAdminCreators = useCallback(async () => {
    try {
      const [pendingSnap, codesSnap] = await Promise.all([
        getDocs(query(
          collection(db, 'creator_applications'),
          where('status', '==', 'pending')
        )),
        getDocs(collection(db, 'creator_codes')),
      ]);
      const apps: CreatorApplication[] = [];
      pendingSnap.forEach((d) => {
        const data = d.data();
        apps.push({
          id: d.id,
          uid: data.uid ?? '',
          channelName: data.channelName ?? '',
          platform: data.platform ?? 'tiktok',
          profileUrl: data.profileUrl ?? '',
          videoUrl: data.videoUrl ?? '',
          requestedCode: data.requestedCode ?? '',
          status: data.status ?? 'pending',
          createdAt: data.createdAt ?? 0,
        });
      });
      apps.sort((a, b) => a.createdAt - b.createdAt);
      setAdminCreatorApplications(apps);

      const codes: CreatorCode[] = [];
      codesSnap.forEach((d) => {
        const data = d.data();
        codes.push({
          code: data.code ?? '',
          uid: data.uid ?? '',
          channelName: data.channelName ?? '',
          platform: data.platform ?? 'tiktok',
          status: data.status ?? 'active',
          createdAt: data.createdAt ?? 0,
          approvedAt: data.approvedAt ?? 0,
          totalReferrals: data.totalReferrals ?? 0,
          pendingQualification: data.pendingQualification ?? 0,
          qualified: data.qualified ?? 0,
          qualifiedThisMonth: data.qualifiedThisMonth ?? 0,
          coinsEarned: data.coinsEarned ?? 0,
        });
      });
      codes.sort((a, b) => b.qualified - a.qualified);
      setAdminCreatorCodes(codes);
    } catch {}
  }, []);

  const adminApproveCreator = useCallback(async (appId: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      if (userRole !== 'admin') return { ok: false, error: 'Solo admin' };
      const appRef = doc(db, 'creator_applications', appId);
      const appDoc = await getDoc(appRef);
      if (!appDoc.exists()) return { ok: false, error: 'Solicitud no encontrada' };
      const appData = appDoc.data();
      if (appData.status !== 'pending') return { ok: false, error: 'Ya procesada' };
      const code = appData.requestedCode ?? '';

      // Re-check code uniqueness
      const codeSnap = await getDocs(query(
        collection(db, 'creator_codes'),
        where('code', '==', code),
        limit(1)
      ));
      if (!codeSnap.empty) return { ok: false, error: 'Codigo ya existe' };

      const user = auth.currentUser;
      const now = Date.now();
      const newCodeRef = doc(collection(db, 'creator_codes'));
      await setDoc(newCodeRef, {
        code,
        uid: appData.uid,
        channelName: appData.channelName,
        platform: appData.platform,
        status: 'active',
        createdAt: now,
        approvedAt: now,
        totalReferrals: 0,
        pendingQualification: 0,
        qualified: 0,
        qualifiedThisMonth: 0,
        coinsEarned: 0,
      });
      await updateDoc(appRef, {
        status: 'approved',
        reviewedAt: now,
        reviewedBy: user?.uid ?? '',
      });

      // Notify creator
      try {
        await addDoc(collection(db, 'notificaciones'), {
          userId: appData.uid,
          title: `🎉 ¡Ya eres creador GarrDash!`,
          message: `Tu codigo ${code} esta activo.`,
          type: 'creator_approved',
          createdAt: now,
          read: false,
        }).catch(() => {});
      } catch {}

      await refreshAdminCreators();
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al aprobar';
      return { ok: false, error: msg };
    }
  }, [userRole, refreshAdminCreators]);

  const adminRejectCreator = useCallback(async (appId: string, reason: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      if (userRole !== 'admin') return { ok: false, error: 'Solo admin' };
      const appRef = doc(db, 'creator_applications', appId);
      const appDoc = await getDoc(appRef);
      if (!appDoc.exists()) return { ok: false, error: 'Solicitud no encontrada' };
      const appData = appDoc.data();
      if (appData.status !== 'pending') return { ok: false, error: 'Ya procesada' };
      const user = auth.currentUser;
      const now = Date.now();
      await updateDoc(appRef, {
        status: 'rejected',
        reviewedAt: now,
        reviewedBy: user?.uid ?? '',
        rejectReason: reason,
      });

      // Notify
      try {
        await addDoc(collection(db, 'notificaciones'), {
          userId: appData.uid,
          title: 'Solicitud de creador revisada',
          message: 'Tu solicitud de creador fue revisada. Entra a GarrDash para ver el estado.',
          type: 'creator_rejected',
          createdAt: now,
          read: false,
        }).catch(() => {});
      } catch {}

      await refreshAdminCreators();
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al rechazar';
      return { ok: false, error: msg };
    }
  }, [userRole, refreshAdminCreators]);

  const adminSuspendCreator = useCallback(async (code: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      if (userRole !== 'admin') return { ok: false, error: 'Solo admin' };
      const codeSnap = await getDocs(query(
        collection(db, 'creator_codes'),
        where('code', '==', code),
        limit(1)
      ));
      if (codeSnap.empty) return { ok: false, error: 'Codigo no encontrado' };
      await updateDoc(codeSnap.docs[0].ref, { status: 'suspended' });
      await refreshAdminCreators();
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al suspender';
      return { ok: false, error: msg };
    }
  }, [userRole, refreshAdminCreators]);

  const adminReactivateCreator = useCallback(async (code: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      if (userRole !== 'admin') return { ok: false, error: 'Solo admin' };
      const codeSnap = await getDocs(query(
        collection(db, 'creator_codes'),
        where('code', '==', code),
        limit(1)
      ));
      if (codeSnap.empty) return { ok: false, error: 'Codigo no encontrado' };
      await updateDoc(codeSnap.docs[0].ref, { status: 'active' });
      await refreshAdminCreators();
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al reactivar';
      return { ok: false, error: msg };
    }
  }, [userRole, refreshAdminCreators]);

  const value: GameState = {
    screen, coins, points, lives, vip, muted, musicEnabled, sfxEnabled, customColor, user: currentUser, selectedCharacter, selectedShip, selectedZombie, loggedIn, email, playerName,
    topPlayerName, topPlayerScore, topPlayerAvatar, absoluteRecord,
    lastRouletteDate, rouletteSpinsToday, suggestions, upgrades,
    spaceRanking, zombieRanking, weeklyRanking, survivalRanking, isOnline, pendingCoins, bloodEnabled,
    controlSize, orientationMode, lastInterstitialTime: lastInterstitialTimeRef.current,
    setScreen, addCoins, spendCoins, addPoints, spendPoints, setLives,
    buyVIP, vipAvailable: VIP_DISPONIBLE_PLAYSTORE, vipExpiry, toggleMute, toggleMusic, toggleSfx, toggleBlood, setControlSize, setOrientationMode,
    uiTheme, setUITheme, setCustomColorState,
    selectCharacter, selectShip, selectZombie, setLoggedIn, recordRouletteSpin,
    addSuggestion, getCharacter: getChar, getShip: getShipDef, getZombieCharacter: getZombieChar, buyUpgrade,
    refreshRanking, refreshWeeklyRanking, loadMoreRanking, hasMoreRanking,
    submitSpaceScore, submitZombieScore, getFreeSpinsRemaining,
    canShowInterstitial, recordInterstitial,
    signIn, signUp, logOut,
    claimDiamonds, sendSuggestion,
    offerwallConfig, refreshOfferwallConfig, offerwallDownloadsToday, recordOfferwallDownload,
    userRole, pendingRequests, refreshPendingRequests, confirmPendingRequest, rejectPendingRequest,
    canjes, refreshCanjes, submitCanje, correctCanjeId, cancelCanje,
    adminApproveCanje, adminMarkCorrection, adminRejectCanje,
    approvedCanjes, canjesPagination, setCanjesPage,
    adminCanjesList, adminApprovedList, refreshAdminCanjes, adminCanjesPage, setAdminCanjesPage,
    adminUserStats, refreshAdminStats,
    searchUsers, userSearchResults, loadMoreUsers, hasMoreUsers, clearUserSearch,
    isDeviceBanned, checkDeviceBan, reportSuspiciousActivity,
    delegateWork, setDelegateWork,
    operatorTurn, startOperatorTurn, endOperatorTurn, operatorOnLunch,
    influencerInfo, refreshInfluencerInfo, requestInfluencerWithdraw,
    adminManualIncome, adminDeleteIncome, adminIncomeRecords, refreshAdminIncomeRecords,
    adminSetExchangeLimit, adminBanUser, adminPanicButton,
    transactionLight, currentUserRank, currentUserScore, allUsersList,
    observerMode, toggleObserverMode,
    addPlayTime,
    flushPlayTime,
    startGameBatch, endGameBatch,
    campaignProgress, towerLevels, survivalBestTime,
    completeLevel, getCurrentCampaignLevel, exchangeDiamonds, buyTower, getTowerLevel,
    submitSurvivalScore, canExchangeDiamonds,
    buyCampaignKey, getCampaignKeyPrice,
    addCampaignKeyFromAd,
    showWelcomeBonus, dismissWelcomeBonus,
    showReturnReward, dismissReturnReward,
    exchangeNotification, dismissExchangeNotification,
    campaignLevelStats, refreshCampaignLevelStats,
    logOperatorAction, operatorLogs, refreshOperatorLogs,
    creatorApplication, creatorCode, creatorReferralCode,
    submitCreatorApplication, refreshCreatorApplication,
    applyReferralCode, refreshCreatorReferralCode,
    creatorStats, refreshCreatorStats,
    creatorRanking, refreshCreatorRanking,
    adminCreatorApplications, adminCreatorCodes, refreshAdminCreators,
    adminApproveCreator, adminRejectCreator, adminSuspendCreator, adminReactivateCreator,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
