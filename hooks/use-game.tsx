'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { CHARACTERS, getCharacter, getShip, getZombieCharacter, type CharacterDef, type ShipDef, type ZombieCharDef } from '@/lib/characters';
import {
  collection, doc, setDoc, getDocs, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp,
  updateDoc, deleteDoc, where, writeBatch, getDoc, Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  type User,
} from 'firebase/auth';
import {
  cacheGet, cacheSet, cacheInvalidatePattern, getStartOfWeek, getDaysAgo,
} from '@/lib/firebase-optimization';
import { MIN_CLAIM_COINS } from '@/lib/config';
import {
  ADMOB_CONFIG, COINS_PER_USD, SOLES_PER_USD, INACTIVITY_THRESHOLD_DAYS,
  NEAR_CLAIM_THRESHOLD, INFLUENCER_MIN_RUNS, INFLUENCER_MIN_SCORE,
  INFLUENCER_MIN_BALANCE, INFLUENCER_MIN_WITHDRAW, INFLUENCER_RECENT_GAMES,
  INFLUENCER_RECENT_DAYS, RETURNED_USER_MIN_GAMES, RETURNED_USER_INACTIVE_DAYS,
  OPERATOR_LUNCH_BREAK_HOURS, RANKING_PAGE_SIZE, VIP_DURATION_DAYS, VIP_DISPONIBLE_PLAYSTORE,
} from '@/lib/config';

export type Screen =
  | 'intro'
  | 'login'
  | 'menu'
  | 'mode-select'
  | 'space-game'
  | 'zombie-game'
  | 'shop'
  | 'roulette'
  | 'characters'
  | 'ranking'
  | 'offerwall'
  | 'admin'
  | 'operator'
  | 'influencer';

export interface UpgradeState {
  fireRate: number;
  damage: number;
  coinMagnet: number;
  superShield: number;
}

export interface RankEntry {
  name: string;
  score: number;
  uid?: string;
  avatar?: string;
}

export type ControlSize = 'small' | 'medium' | 'large';
export type OrientationMode = 'auto' | 'portrait' | 'landscape';

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
  returnedUsers: AdminUserInfo[];
  nearClaimSummary: NearClaimSummary;
}

interface GameState {
  screen: Screen;
  coins: number;
  points: number;
  lives: number;
  vip: boolean;
  muted: boolean;
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
  spaceRanking: RankEntry[];
  zombieRanking: RankEntry[];
  weeklyRanking: RankEntry[];
  isOnline: boolean;
  pendingCoins: number;
  bloodEnabled: boolean;
  controlSize: ControlSize;
  orientationMode: OrientationMode;
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
  adminManualIncome: (amount: number) => Promise<{ ok: boolean; error?: string }>;
  adminSetExchangeLimit: (limit: number) => Promise<{ ok: boolean; error?: string }>;
  adminBanUser: (uid: string) => Promise<{ ok: boolean; error?: string }>;
  adminPanicButton: () => Promise<{ ok: boolean; error?: string }>;
  transactionLight: TransactionLight;
  currentUserRank: number | null;
  observerMode: boolean;
  toggleObserverMode: () => void;
  addPlayTime: (ms: number) => void;
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
  const [lives, setLivesState] = useState(3);
  const [vip, setVip] = useState(false);
  const [muted, setMuted] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('alpha');
  const [selectedShip, setSelectedShip] = useState('alpha');
  const [selectedZombie, setSelectedZombie] = useState('soldier');
  const [loggedIn, setLoggedInState] = useState(false);
  const [email, setEmail] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [topPlayerName, setTopPlayerName] = useState('Garricraft_YT');
  const [topPlayerScore, setTopPlayerScore] = useState(154820);
  const [topPlayerAvatar, setTopPlayerAvatar] = useState<string | undefined>(undefined);
  const [absoluteRecord, setAbsoluteRecord] = useState(154820);
  const [lastRouletteDate, setLastRouletteDate] = useState('');
  const [rouletteSpinsToday, setRouletteSpinsToday] = useState(0);
  const [suggestions, setSuggestions] = useState<Array<{ id: number; text: string; date: string }>>([]);
  const [upgrades, setUpgrades] = useState<UpgradeState>({ fireRate: 0, damage: 0, coinMagnet: 0, superShield: 0 });
  const [spaceRanking, setSpaceRanking] = useState<RankEntry[]>(EMPTY_RANKING);
  const [zombieRanking, setZombieRanking] = useState<RankEntry[]>(EMPTY_RANKING);
  const [weeklyRanking, setWeeklyRanking] = useState<RankEntry[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCoins, setPendingCoins] = useState(0);
  const [bloodEnabled, setBloodEnabled] = useState(true);
  const [controlSize, setControlSizeState] = useState<ControlSize>('medium');
  const [orientationMode, setOrientationModeState] = useState<OrientationMode>('auto');
  const [authReady, setAuthReady] = useState(false);
  const [offerwallConfig, setOfferwallConfig] = useState<OfferwallConfig | null>(null);
  const [offerwallDownloadsToday, setOfferwallDownloadsToday] = useState(0);
  const [userRole, setUserRole] = useState<'user' | 'operador' | 'admin'>('user');
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [adminUserStats, setAdminUserStats] = useState<AdminStats>({
    totalUsers: 0, totalCoins: 0, activeCoins: 0, inactiveCoins: 0,
    reservedAmount: 0, availableAmount: 0, nearClaimUsers: [], activeUsers: 0, inactiveUsers: 0, returnedUsers: [],
    nearClaimSummary: { totalEstimatedCost: 0, totalEstimatedRevenue: 0, totalNet: 0, count: 0 },
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
  const [vipExpiry, setVipExpiry] = useState<string | null>(null);
  const [observerMode, setObserverMode] = useState(false);

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
    if (s.bloodEnabled !== undefined) setBloodEnabled(s.bloodEnabled);
    if (s.controlSize !== undefined) setControlSizeState(s.controlSize);
    if (s.orientationMode !== undefined) setOrientationModeState(s.orientationMode);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setLoggedInState(true);
        setEmail(user.email ?? '');
        const name = user.email?.split('@')[0] ?? 'Player';
        setPlayerName(name);
        saveData({ loggedIn: true, email: user.email ?? '', playerName: name });
        let role: 'user' | 'operador' | 'admin' = 'user';
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.rol === 'admin') role = 'admin';
            else if (data.rol === 'operador') role = 'operador';
            else role = 'user';
            if (data.lastLogin) {
              await updateDoc(doc(db, 'usuarios', user.uid), { lastLogin: serverTimestamp() });
            }
          }
        } catch {}
        setUserRole(role);
        if (role === 'admin') {
          setScreenState('admin');
        } else if (role === 'operador') {
          setScreenState('operator');
        } else {
          setScreenState('menu');
        }
      } else {
        setLoggedInState(false);
        setUserRole('user');
        saveData({ loggedIn: false });
      }
      setAuthReady(true);
    });
    return () => unsub();
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
    try {
      const topRef = doc(db, 'global', 'top1');
      const unsub = onSnapshot(topRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const name = data.name || data.nickname || 'Garricraft_YT';
          const score = data.score || 0;
          const avatar = data.avatar;
          if (score > 0) {
            setTopPlayerName(name);
            setTopPlayerScore(score);
            setAbsoluteRecord(score);
            if (avatar) setTopPlayerAvatar(avatar);
          }
        }
      });
      return () => unsub();
    } catch {}
  }, []);

  useEffect(() => {
    const spaceTop = spaceRanking[0];
    const zombieTop = zombieRanking[0];
    const candidates: RankEntry[] = [];
    if (spaceTop) candidates.push(spaceTop);
    if (zombieTop) candidates.push(zombieTop);
    if (candidates.length > 0) {
      const best = candidates.reduce((a, b) => (b.score > a.score ? b : a));
      if (best.score > absoluteRecord) {
        setTopPlayerName(best.name);
        setTopPlayerScore(best.score);
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
    if (muted || screen === 'intro' || screen === 'login') {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  }, [muted, screen]);

  const setScreen = useCallback((s: Screen) => setScreenState(s), []);

  const addCoins = useCallback((n: number) => {
    if (!isOnline) {
      setPendingCoins((prev) => prev + n);
      return;
    }
    setCoins((prev) => {
      const next = prev + n;
      saveData({ coins: next });
      return next;
    });
  }, [isOnline]);

  const spendCoins = useCallback((n: number): boolean => {
    let ok = false;
    setCoins((prev) => {
      if (prev >= n) {
        ok = true;
        const next = prev - n;
        saveData({ coins: next });
        return next;
      }
      return prev;
    });
    return ok;
  }, []);

  const addPoints = useCallback((n: number) => {
    setPoints((prev) => {
      const next = prev + n;
      saveData({ points: next });
      return next;
    });
  }, []);

  const spendPoints = useCallback((n: number): boolean => {
    let ok = false;
    setPoints((prev) => {
      if (prev >= n) {
        ok = true;
        const next = prev - n;
        saveData({ points: next });
        return next;
      }
      return prev;
    });
    return ok;
  }, []);

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
        const snap = await getDoc(userDocRef);
        const current = snap.exists() ? (snap.data().tiempo_jugado_min ?? 0) : 0;
        const newMin = current + addMs / 60000;
        await updateDoc(userDocRef, { tiempo_jugado_min: newMin });
      } catch {}
    }, 8000);
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
    let ok = false;
    setCoins((prev) => {
      if (prev >= cost) {
        ok = true;
        const nextCoins = prev - cost;
        saveData({ coins: nextCoins });
        setUpgrades((prevUp) => {
          const nextUp = { ...prevUp, [key]: prevUp[key] + 1 };
          saveData({ upgrades: nextUp });
          return nextUp;
        });
        return nextCoins;
      }
      return prev;
    });
    return ok;
  }, []);

  const refreshRanking = useCallback(async () => {
    return Promise.resolve();
  }, []);

  const refreshWeeklyRanking = useCallback(async () => {
    return Promise.resolve();
  }, []);

  const loadMoreRanking = useCallback(async (_type: 'space' | 'zombie' | 'weekly') => {
    return Promise.resolve();
  }, []);

  const hasMoreRanking = useCallback((_type: 'space' | 'zombie' | 'weekly') => false, []);

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
        setSpaceRanking(entries);
      }, () => setSpaceRanking([])));

      const zombieQ = query(collection(db, 'usuarios'), orderBy('puntos_zombies', 'desc'), limit(RANKING_PAGE_SIZE));
      unsubs.push(onSnapshot(zombieQ, (snap) => {
        const entries: RankEntry[] = [];
        snap.forEach((d) => {
          const data = d.data();
          entries.push({ name: data.nombre || data.email?.split('@')[0] || 'Jugador', score: data.puntos_zombies ?? 0, uid: d.id });
        });
        setZombieRanking(entries);
      }, () => setZombieRanking([])));

      const weeklyQ = query(collection(db, 'usuarios'), orderBy('puntos_semanales', 'desc'), limit(RANKING_PAGE_SIZE));
      unsubs.push(onSnapshot(weeklyQ, (snap) => {
        const entries: RankEntry[] = [];
        snap.forEach((d) => {
          const data = d.data();
          entries.push({ name: data.nombre || data.email?.split('@')[0] || 'Jugador', score: data.puntos_semanales ?? 0, uid: d.id });
        });
        setWeeklyRanking(entries);
      }, () => setWeeklyRanking([])));
    } catch {}
    return () => unsubs.forEach((u) => u());
  }, []);

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
      if (user) {
        const userRef = doc(db, 'usuarios', user.uid);
        const userDoc = await getDoc(userRef);
        const currentCoins = userDoc.data()?.coins ?? coins;
        const totalRuns = (userDoc.data()?.totalRuns ?? 0) + 1;
        const bestScore = Math.max(userDoc.data()?.bestScore ?? 0, score);
        await updateDoc(userRef, { totalRuns, bestScore, lastActive: serverTimestamp() });
        void currentCoins;
      }
      cacheInvalidatePattern('ranking');
    } catch {}
  }, [email, playerName, absoluteRecord, isOnline, coins]);

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
      if (user) {
        const userRef = doc(db, 'usuarios', user.uid);
        const userDoc = await getDoc(userRef);
        const totalRuns = (userDoc.data()?.totalRuns ?? 0) + 1;
        const bestScore = Math.max(userDoc.data()?.bestScore ?? 0, score);
        await updateDoc(userRef, { totalRuns, bestScore, lastActive: serverTimestamp() });
      }
      cacheInvalidatePattern('ranking');
    } catch {}
  }, [email, playerName, absoluteRecord, isOnline]);

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
      await setDoc(doc(db, 'usuarios', uid), {
        nombre: data.fullName,
        edad: data.age,
        pais: data.country,
        email: data.email,
        coins: 0,
        totalRuns: 0,
        bestScore: 0,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        rol: 'user',
      });
      const name = data.email.split('@')[0] ?? 'Player';
      setPlayerName(name);
      saveData({ playerName: name });
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
      await addDoc(collection(db, 'solicitudes_pendientes'), {
        userId: user.uid,
        playerID: playerID.trim(),
        nickname: nickname.trim(),
        tiempoJugado: scoreRef.current || 0,
        puntosGastados: 10,
        fecha: serverTimestamp(),
        estado: 'pendiente',
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
          rewardPerDownload: data.rewardPerDownload ?? 1000,
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

  const refreshAdminStats = useCallback(async () => {
    return Promise.resolve();
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'usuarios'), (snap) => {
        let totalCoins = 0;
        let totalUsers = 0;
        let activeCoins = 0;
        let inactiveCoins = 0;
        let activeUsers = 0;
        let inactiveUsers = 0;
        const nearClaim: AdminUserInfo[] = [];
        const returnedUsers: AdminUserInfo[] = [];
        const sevenDaysAgo = getDaysAgo(INACTIVITY_THRESHOLD_DAYS);
        const fifteenDaysAgo = getDaysAgo(RETURNED_USER_INACTIVE_DAYS);

        snap.forEach((d) => {
          const data = d.data();
          const userCoins = data.coins ?? 0;
          totalCoins += userCoins;
          totalUsers++;
          const lastLoginRaw = data.lastLogin ?? data.lastActive;
          let lastLoginDate: Date;
          if (lastLoginRaw && typeof lastLoginRaw.toDate === 'function') {
            lastLoginDate = lastLoginRaw.toDate();
          } else if (lastLoginRaw) {
            lastLoginDate = new Date(lastLoginRaw);
          } else {
            lastLoginDate = new Date(0);
          }
          const isInactive = lastLoginDate < sevenDaysAgo;
          if (isInactive) {
            inactiveCoins += userCoins;
            inactiveUsers++;
          } else {
            activeCoins += userCoins;
            activeUsers++;
          }
          if (userCoins >= NEAR_CLAIM_THRESHOLD) {
            nearClaim.push({
              uid: d.id,
              nombre: data.nombre ?? data.email ?? 'Unknown',
              email: data.email ?? '',
              coins: userCoins,
              lastLogin: lastLoginDate.toISOString(),
              inactive: isInactive,
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
              adsWatched: data.adsWatched ?? 0,
              bitlabsEarnings: data.bitlabsEarnings ?? 0,
            });
          }
          if (lastLoginDate < fifteenDaysAgo && (data.totalRuns ?? 0) < RETURNED_USER_MIN_GAMES) {
            returnedUsers.push({
              uid: d.id,
              nombre: data.nombre ?? data.email ?? 'Unknown',
              email: data.email ?? '',
              coins: userCoins,
              lastLogin: lastLoginDate.toISOString(),
              inactive: true,
              totalRuns: data.totalRuns ?? 0,
              bestScore: data.bestScore ?? 0,
              rol: data.rol ?? 'user',
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
          totalUsers, totalCoins, activeCoins, inactiveCoins,
          reservedAmount, availableAmount, nearClaimUsers: nearClaim,
          activeUsers, inactiveUsers, returnedUsers, nearClaimSummary,
        });
        if (reservedAmount > 0) {
          const ratio = activeCoins / (totalCoins || 1);
          if (ratio > 0.8) setTransactionLight('green');
          else if (ratio > 0.5) setTransactionLight('yellow');
          else setTransactionLight('red');
        }
      }, () => {});
      return () => unsub();
    } catch { return; }
  }, []);

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
    return Promise.resolve();
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

  const adminManualIncome = useCallback(async (amount: number): Promise<{ ok: boolean; error?: string }> => {
    try {
      await addDoc(collection(db, 'admin_income'), {
        amount,
        date: serverTimestamp(),
        type: 'manual',
      });
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar ingreso';
      return { ok: false, error: msg };
    }
  }, []);

  const adminSetExchangeLimit = useCallback(async (limit: number): Promise<{ ok: boolean; error?: string }> => {
    try {
      await setDoc(doc(db, 'config', 'exchange'), { maxDaily: limit }, { merge: true });
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar limite';
      return { ok: false, error: msg };
    }
  }, []);

  const adminBanUser = useCallback(async (uid: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      await updateDoc(doc(db, 'usuarios', uid), { banned: true, bannedDate: serverTimestamp() });
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al banear usuario';
      return { ok: false, error: msg };
    }
  }, []);

  const adminPanicButton = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      await setDoc(doc(db, 'config', 'global'), { panicMode: true, panicTime: serverTimestamp() }, { merge: true });
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al activar panico';
      return { ok: false, error: msg };
    }
  }, []);

  useEffect(() => {
    if (!loggedIn || !auth.currentUser) return;
    const userUid = auth.currentUser.uid;
    const checkRank = () => {
      const rankings = [spaceRanking, zombieRanking, weeklyRanking];
      for (const ranking of rankings) {
        const idx = ranking.findIndex((e) => e.uid === userUid || e.name === playerName);
        if (idx >= 0) {
          setCurrentUserRank(idx + 1);
          return;
        }
      }
      setCurrentUserRank(null);
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
        const userPoints = userData.puntos ?? 0;
        if (userPoints <= 0) {
          setCurrentUserRank(null);
          return;
        }
        const countQ = query(collection(db, 'usuarios'), where('puntos', '>', userPoints));
        const countSnap = await getDocs(countQ);
        setCurrentUserRank(countSnap.size + 1);
      } catch {
        setCurrentUserRank(null);
      }
    };
    computeDynamicRank();
  }, [spaceRanking, zombieRanking, weeklyRanking, loggedIn, playerName]);

  const value: GameState = {
    screen, coins, points, lives, vip, muted, selectedCharacter, selectedShip, selectedZombie, loggedIn, email, playerName,
    topPlayerName, topPlayerScore, topPlayerAvatar, absoluteRecord,
    lastRouletteDate, rouletteSpinsToday, suggestions, upgrades,
    spaceRanking, zombieRanking, weeklyRanking, isOnline, pendingCoins, bloodEnabled,
    controlSize, orientationMode, lastInterstitialTime: lastInterstitialTimeRef.current,
    setScreen, addCoins, spendCoins, addPoints, spendPoints, setLives,
    buyVIP, vipAvailable: VIP_DISPONIBLE_PLAYSTORE, vipExpiry, toggleMute, toggleBlood, setControlSize, setOrientationMode,
    selectCharacter, selectShip, selectZombie, setLoggedIn, recordRouletteSpin,
    addSuggestion, getCharacter: getChar, getShip: getShipDef, getZombieCharacter: getZombieChar, buyUpgrade,
    refreshRanking, refreshWeeklyRanking, loadMoreRanking, hasMoreRanking,
    submitSpaceScore, submitZombieScore, getFreeSpinsRemaining,
    canShowInterstitial, recordInterstitial,
    signIn, signUp, logOut,
    claimDiamonds, sendSuggestion,
    offerwallConfig, refreshOfferwallConfig, offerwallDownloadsToday, recordOfferwallDownload,
    userRole, pendingRequests, refreshPendingRequests, confirmPendingRequest, rejectPendingRequest,
    adminUserStats, refreshAdminStats,
    searchUsers, userSearchResults, loadMoreUsers, hasMoreUsers, clearUserSearch,
    isDeviceBanned, checkDeviceBan, reportSuspiciousActivity,
    delegateWork, setDelegateWork,
    operatorTurn, startOperatorTurn, endOperatorTurn, operatorOnLunch,
    influencerInfo, refreshInfluencerInfo, requestInfluencerWithdraw,
    adminManualIncome, adminSetExchangeLimit, adminBanUser, adminPanicButton,
    transactionLight, currentUserRank,
    observerMode, toggleObserverMode,
    addPlayTime,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
