'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { CHARACTERS, getCharacter, getShip, getZombieCharacter, type CharacterDef, type ShipDef, type ZombieCharDef } from '@/lib/characters';
import {
  collection, doc, setDoc, getDocs, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  | 'ranking';

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
  setScreen: (s: Screen) => void;
  addCoins: (n: number) => void;
  spendCoins: (n: number) => boolean;
  addPoints: (n: number) => void;
  spendPoints: (n: number) => boolean;
  setLives: (n: number) => void;
  buyVIP: () => void;
  toggleMute: () => void;
  toggleBlood: () => void;
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
  lastRouletteDate: string;
  rouletteSpinsToday: number;
  suggestions: Array<{ id: number; text: string; date: string }>;
  upgrades: UpgradeState;
  bloodEnabled: boolean;
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

  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    if (s.lastRouletteDate !== undefined) setLastRouletteDate(s.lastRouletteDate);
    if (s.rouletteSpinsToday !== undefined) setRouletteSpinsToday(s.rouletteSpinsToday);
    if (s.suggestions !== undefined) setSuggestions(s.suggestions);
    if (s.upgrades !== undefined) setUpgrades(s.upgrades);
    if (s.bloodEnabled !== undefined) setBloodEnabled(s.bloodEnabled);
  }, []);

  // Online/offline detection via navigator.onLine + event listeners
  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    const update = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      // When coming back online, flush pending coins to permanent balance
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

  // Firebase: subscribe to top1 record (absolute record across all modes)
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

  // Derive the absolute top player from both rankings (highest score wins)
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
      // Queue to pending coins; will flush to permanent balance on reconnect
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
    if (playerEmail) setEmail(playerEmail);
    saveData({ loggedIn: v, email: playerEmail ?? '' });
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
    if (!isOnline) return; // Skip Firebase writes when offline
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

  // Auto-refresh ranking every 10 seconds
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
    if (!isOnline) return; // Skip Firebase writes when offline
    try {
      const playerName = email.split('@')[0] || 'Player';
      await addDoc(collection(db, 'scores_space'), {
        name: playerName,
        score,
        date: serverTimestamp(),
      });
      // Update local ranking
      setSpaceRanking((prev) => {
        const next = [...prev, { name: playerName, score }];
        next.sort((a, b) => b.score - a.score);
        return next.slice(0, 10);
      });
      // Update global top1 doc if this score beats the absolute record
      if (score > absoluteRecord) {
        await setDoc(doc(db, 'global', 'top1'), { name: playerName, score }, { merge: true });
        setAbsoluteRecord(score);
        setTopPlayerName(playerName);
        setTopPlayerScore(score);
      }
    } catch {
      // ignore
    }
  }, [email, absoluteRecord, isOnline]);

  const submitZombieScore = useCallback(async (score: number) => {
    if (!isOnline) return; // Skip Firebase writes when offline
    try {
      const playerName = email.split('@')[0] || 'Player';
      await addDoc(collection(db, 'scores_zombie'), {
        name: playerName,
        score,
        date: serverTimestamp(),
      });
      setZombieRanking((prev) => {
        const next = [...prev, { name: playerName, score }];
        next.sort((a, b) => b.score - a.score);
        return next.slice(0, 10);
      });
      // Update global top1 doc if this score beats the absolute record
      if (score > absoluteRecord) {
        await setDoc(doc(db, 'global', 'top1'), { name: playerName, score }, { merge: true });
        setAbsoluteRecord(score);
        setTopPlayerName(playerName);
        setTopPlayerScore(score);
      }
    } catch {
      // ignore
    }
  }, [email, absoluteRecord, isOnline]);

  const value: GameState = {
    screen, coins, points, lives, vip, muted, selectedCharacter, selectedShip, selectedZombie, loggedIn, email,
    topPlayerName, topPlayerScore, absoluteRecord,
    lastRouletteDate, rouletteSpinsToday, suggestions, upgrades,
    spaceRanking, zombieRanking, isOnline, pendingCoins, bloodEnabled,
    setScreen, addCoins, spendCoins, addPoints, spendPoints, setLives,
    buyVIP, toggleMute, toggleBlood, selectCharacter, selectShip, selectZombie, setLoggedIn, recordRouletteSpin,
    addSuggestion, getCharacter: getChar, getShip: getShipDef, getZombieCharacter: getZombieChar, buyUpgrade, refreshRanking,
    submitSpaceScore, submitZombieScore, getFreeSpinsRemaining,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
