'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { CHARACTERS, getCharacter, getShip, getZombieCharacter, type CharacterDef, type ShipDef, type ZombieCharDef } from '@/lib/characters';
import {
  collection, doc, setDoc, getDocs, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp,
  updateDoc, deleteDoc, where,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  type User,
} from 'firebase/auth';

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
  | 'admin';

export interface UpgradeState {
  fireRate: number;
  damage: number;
  coinMagnet: number;
  superShield: number;
}

export interface RankEntry {
  name: string;
  score: number;
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
  absoluteRecord: number;
  lastRouletteDate: string;
  rouletteSpinsToday: number;
  suggestions: Array<{ id: number; text: string; date: string }>;
  upgrades: UpgradeState;
  spaceRanking: RankEntry[];
  zombieRanking: RankEntry[];
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
  adminUserStats: { totalUsers: number; totalCoins: number; reservedAmount: number; availableAmount: number; nearClaimUsers: AdminUserInfo[] };
  refreshAdminStats: () => Promise<void>;
  isDeviceBanned: boolean;
  checkDeviceBan: () => Promise<void>;
  reportSuspiciousActivity: (type: string, details: string) => void;
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
  } catch {
    // ignore
  }
}

export const UPGRADE_COSTS: Record<keyof UpgradeState, number> = {
  fireRate: 500,
  damage: 800,
  coinMagnet: 600,
  superShield: 1000,
};

const FALLBACK_SPACE: RankEntry[] = [
  { name: 'Garricraft_YT', score: 154820 },
  { name: 'NovaStrike', score: 98450 },
  { name: 'CosmicBlade', score: 87200 },
  { name: 'VoidHunter', score: 76100 },
  { name: 'StarForge', score: 65400 },
  { name: 'NebulaX', score: 54300 },
  { name: 'OrbitKiller', score: 43200 },
  { name: 'PulsarPrime', score: 32100 },
  { name: 'AstroViper', score: 21000 },
  { name: 'CometDash', score: 10000 },
];

const FALLBACK_ZOMBIE: RankEntry[] = [
  { name: 'Garricraft_YT', score: 8420 },
  { name: 'BloodReaper', score: 7200 },
  { name: 'ToothGrinder', score: 6100 },
  { name: 'FleshStorm', score: 5400 },
  { name: 'GraveWalker', score: 4300 },
  { name: 'ScreamKing', score: 3200 },
  { name: 'RiotBuster', score: 2100 },
  { name: 'PlagueDoc', score: 1500 },
  { name: 'HordeBreaker', score: 800 },
  { name: 'LastStand', score: 400 },
];

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
  const [absoluteRecord, setAbsoluteRecord] = useState(154820);
  const [lastRouletteDate, setLastRouletteDate] = useState('');
  const [rouletteSpinsToday, setRouletteSpinsToday] = useState(0);
  const [suggestions, setSuggestions] = useState<Array<{ id: number; text: string; date: string }>>([]);
  const [upgrades, setUpgrades] = useState<UpgradeState>({ fireRate: 0, damage: 0, coinMagnet: 0, superShield: 0 });
  const [spaceRanking, setSpaceRanking] = useState<RankEntry[]>(FALLBACK_SPACE);
  const [zombieRanking, setZombieRanking] = useState<RankEntry[]>(FALLBACK_ZOMBIE);
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
  const [adminUserStats, setAdminUserStats] = useState({ totalUsers: 0, totalCoins: 0, reservedAmount: 0, availableAmount: 0, nearClaimUsers: [] as AdminUserInfo[] });
  const [isDeviceBanned, setIsDeviceBanned] = useState(false);

  const lastInterstitialTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    const s = loadSave();
    if (s.coins !== undefined) setCoins(s.coins);
    if (s.points !== undefined) setPoints(s.points);
    if (s.vip !== undefined) setVip(s.vip);
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

  // Firebase Auth: persistent session via onAuthStateChanged
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setLoggedInState(true);
        setEmail(user.email ?? '');
        const name = user.email?.split('@')[0] ?? 'Player';
        setPlayerName(name);
        saveData({ loggedIn: true, email: user.email ?? '', playerName: name });
        setScreenState((prev) => (prev === 'intro' || prev === 'login' ? 'menu' : prev));
        // Fetch user role from Firestore
        try {
          getDocs(query(collection(db, 'usuarios'), where('email', '==', user.email ?? ''))).then((snap) => {
            snap.forEach((d) => {
              const data = d.data();
              if (data.rol === 'admin') setUserRole('admin');
              else if (data.rol === 'operador') setUserRole('operador');
              else setUserRole('user');
            });
          }).catch(() => {});
        } catch {}
      } else {
        setLoggedInState(false);
        setUserRole('user');
        saveData({ loggedIn: false });
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Online/offline detection via navigator.onLine + event listeners
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

  // Firebase: subscribe to top1 record
  useEffect(() => {
    try {
      const topRef = doc(db, 'global', 'top1');
      const unsub = onSnapshot(topRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const name = data.name || data.nickname || 'Garricraft_YT';
          const score = data.score || 0;
          if (score > 0) {
            setTopPlayerName(name);
            setTopPlayerScore(score);
            setAbsoluteRecord(score);
          }
        }
      });
      return () => unsub();
    } catch {
      // ignore
    }
  }, []);

  // Derive the absolute top player from both rankings
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

  // Audio: copyright-free loop from Pixabay
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
    setVip(true);
    saveData({ vip: true });
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
    } catch {
      // ignore
    }
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
    try {
      const sq = query(collection(db, 'scores_space'), orderBy('score', 'desc'), limit(10));
      const sSnap = await getDocs(sq);
      const sEntries: RankEntry[] = [];
      sSnap.forEach((d) => {
        const data = d.data();
        sEntries.push({ name: data.name || 'Unknown', score: data.score || 0 });
      });
      if (sEntries.length > 0) setSpaceRanking(sEntries);

      const zq = query(collection(db, 'scores_zombie'), orderBy('score', 'desc'), limit(10));
      const zSnap = await getDocs(zq);
      const zEntries: RankEntry[] = [];
      zSnap.forEach((d) => {
        const data = d.data();
        zEntries.push({ name: data.name || 'Unknown', score: data.score || 0 });
      });
      if (zEntries.length > 0) setZombieRanking(zEntries);
    } catch {
      // keep fallbacks
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshRanking();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshRanking]);

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
      const playerNameToUse = playerName || email.split('@')[0] || 'Player';
      await addDoc(collection(db, 'scores_space'), {
        name: playerNameToUse,
        score,
        date: serverTimestamp(),
      });
      setSpaceRanking((prev) => {
        const next = [...prev, { name: playerNameToUse, score }];
        next.sort((a, b) => b.score - a.score);
        return next.slice(0, 10);
      });
      if (score > absoluteRecord) {
        await setDoc(doc(db, 'global', 'top1'), { name: playerNameToUse, score }, { merge: true });
        setAbsoluteRecord(score);
        setTopPlayerName(playerNameToUse);
        setTopPlayerScore(score);
      }
    } catch {
      // ignore
    }
  }, [email, playerName, absoluteRecord, isOnline]);

  const submitZombieScore = useCallback(async (score: number) => {
    if (!isOnline) return;
    try {
      const playerNameToUse = playerName || email.split('@')[0] || 'Player';
      await addDoc(collection(db, 'scores_zombie'), {
        name: playerNameToUse,
        score,
        date: serverTimestamp(),
      });
      setZombieRanking((prev) => {
        const next = [...prev, { name: playerNameToUse, score }];
        next.sort((a, b) => b.score - a.score);
        return next.slice(0, 10);
      });
      if (score > absoluteRecord) {
        await setDoc(doc(db, 'global', 'top1'), { name: playerNameToUse, score }, { merge: true });
        setAbsoluteRecord(score);
        setTopPlayerName(playerNameToUse);
        setTopPlayerScore(score);
      }
    } catch {
      // ignore
    }
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
        createdAt: serverTimestamp(),
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
    } catch {
      // ignore
    }
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
      const snap = await getDocs(doc(db, 'config', 'offerwall').parent
        ? query(collection(db, 'config'))
        : query(collection(db, 'config')));
      snap.forEach((d) => {
        if (d.id === 'offerwall') {
          const data = d.data();
          setOfferwallConfig({
            active: data.active ?? false,
            link: data.link ?? '',
            rewardPerDownload: data.rewardPerDownload ?? 1000,
            dailyLimit: data.dailyLimit ?? 2,
          });
        }
      });
    } catch {
      // config not set yet, offerwall stays disabled
    }
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

  // Reset daily offerwall counter at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    const timeout = setTimeout(() => {
      setOfferwallDownloadsToday(0);
      // Set daily interval after first reset
      const interval = setInterval(() => setOfferwallDownloadsToday(0), 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, msUntilMidnight);
    return () => clearTimeout(timeout);
  }, []);

  const refreshPendingRequests = useCallback(async () => {
    try {
      const q = query(collection(db, 'solicitudes_pendientes'), where('estado', '==', 'pendiente'));
      const snap = await getDocs(q);
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
    } catch {
      // ignore
    }
  }, []);

  const confirmPendingRequest = useCallback(async (requestId: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) return { ok: false, error: 'No autenticado' };
      const reqRef = doc(db, 'solicitudes_pendientes', requestId);
      const snap = await getDocs(query(collection(db, 'solicitudes_pendientes'), where('__name__', '==', requestId)));
      if (snap.empty) return { ok: false, error: 'Solicitud no encontrada' };
      let requestData: any = {};
      snap.forEach((d) => { requestData = d.data(); });
      // Copy to confirmed collection
      await setDoc(doc(db, 'solicitudes_confirmadas', requestId), {
        ...requestData,
        estado: 'completado',
        procesadoPor: user.uid,
        procesadoFecha: serverTimestamp(),
      });
      // Delete from pending
      await deleteDoc(reqRef);
      // Update local state
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al confirmar solicitud';
      return { ok: false, error: msg };
    }
  }, []);

  const refreshAdminStats = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'usuarios'));
      let totalCoins = 0;
      let totalUsers = 0;
      const nearClaim: AdminUserInfo[] = [];
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      let activeCoins = 0;
      let inactiveCoins = 0;
      snap.forEach((d) => {
        const data = d.data();
        const userCoins = data.coins ?? 0;
        totalCoins += userCoins;
        totalUsers++;
        const lastLoginDate = data.lastLogin?.toDate?.() ?? new Date(0);
        const isInactive = lastLoginDate.getTime() < sevenDaysAgo;
        if (isInactive) inactiveCoins += userCoins;
        else activeCoins += userCoins;
        if (userCoins >= 12000) {
          nearClaim.push({
            uid: d.id,
            nombre: data.nombre ?? data.email ?? 'Unknown',
            email: data.email ?? '',
            coins: userCoins,
            lastLogin: lastLoginDate.toISOString(),
            inactive: isInactive,
          });
        }
      });
      nearClaim.sort((a, b) => b.coins - a.coins);
      // 15000 coins = S/. 3.80 soles / $1.00 USD
      const reservedAmount = (activeCoins / 15000) * 3.80;
      const availableAmount = (inactiveCoins / 15000) * 3.80;
      setAdminUserStats({ totalUsers, totalCoins, reservedAmount, availableAmount, nearClaimUsers: nearClaim });
    } catch {
      // ignore
    }
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
    } catch {
      // ignore
    }
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
    } catch {
      // ignore
    }
  }, [email]);

  const value: GameState = {
    screen, coins, points, lives, vip, muted, selectedCharacter, selectedShip, selectedZombie, loggedIn, email, playerName,
    topPlayerName, topPlayerScore, absoluteRecord,
    lastRouletteDate, rouletteSpinsToday, suggestions, upgrades,
    spaceRanking, zombieRanking, isOnline, pendingCoins, bloodEnabled,
    controlSize, orientationMode, lastInterstitialTime: lastInterstitialTimeRef.current,
    setScreen, addCoins, spendCoins, addPoints, spendPoints, setLives,
    buyVIP, toggleMute, toggleBlood, setControlSize, setOrientationMode,
    selectCharacter, selectShip, selectZombie, setLoggedIn, recordRouletteSpin,
    addSuggestion, getCharacter: getChar, getShip: getShipDef, getZombieCharacter: getZombieChar, buyUpgrade, refreshRanking,
    submitSpaceScore, submitZombieScore, getFreeSpinsRemaining,
    canShowInterstitial, recordInterstitial,
    signIn, signUp, logOut,
    claimDiamonds, sendSuggestion,
    offerwallConfig, refreshOfferwallConfig, offerwallDownloadsToday, recordOfferwallDownload,
    userRole, pendingRequests, refreshPendingRequests, confirmPendingRequest,
    adminUserStats, refreshAdminStats,
    isDeviceBanned, checkDeviceBan, reportSuspiciousActivity,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
