'use client';

import { useEffect, useRef, useState } from 'react';
import { GameProvider, useGame } from '@/hooks/use-game';
import { ShieldAlert, X } from 'lucide-react';
import { IntroScreen } from '@/components/screens/IntroScreen';
import { LoginScreen } from '@/components/screens/LoginScreen';
import { MenuScreen } from '@/components/screens/MenuScreen';
import { ModeSelectScreen } from '@/components/screens/ModeSelectScreen';
import { CampaignMapScreen } from '@/components/screens/CampaignMapScreen';
import { SpaceGameScreen } from '@/components/screens/SpaceGameScreen';
import { ZombieGameScreen } from '@/components/screens/ZombieGameScreen';
import { SurvivalScreen } from '@/components/screens/SurvivalScreen';
import { ShopScreen } from '@/components/screens/ShopScreen';
import { RouletteScreen } from '@/components/screens/RouletteScreen';
import { CanjesScreen } from '@/components/screens/CanjesScreen';
import { CharactersScreen } from '@/components/screens/CharactersScreen';
import { RankingScreen } from '@/components/screens/RankingScreen';
import { OfferwallScreen } from '@/components/screens/OfferwallScreen';
import { AdminScreen } from '@/components/screens/AdminScreen';
import { OperatorScreen } from '@/components/screens/OperatorScreen';
import { InfluencerScreen } from '@/components/screens/InfluencerScreen';
import { ArcadeHub } from '@/components/screens/ArcadeHub';
import { NeonMazeSurvival } from '@/components/screens/NeonMazeSurvival';
import { AdBanner } from '@/components/game/AdBanner';
import { InterstitialAd } from '@/components/game/InterstitialAd';
import { pauseAudio, resumeAudio } from '@/lib/audio';
import { acquireWakeLock, releaseWakeLock } from '@/lib/wake-lock';
import { AdMob } from '@capacitor-community/admob';
import { checkMinVersion } from '@/lib/firebase';
import { ForceUpdateModal } from '@/components/game/ForceUpdateModal';

const GAMEPLAY_SCREENS = ['space-game', 'zombie-game', 'survival', 'neon-maze'];
const MENU_SCREENS = ['menu', 'login', 'intro', 'mode-select', 'campaign', 'shop', 'roulette', 'characters', 'ranking', 'offerwall', 'admin', 'operator', 'influencer', 'arcade'];
const INTERSTITIAL_INTERVAL_MS = 5 * 60 * 1000;
const CAMPAIGN_SCREENS = ['campaign', 'space-game', 'zombie-game', 'survival', 'neon-maze'];

function GameRouter() {
  const { screen } = useGame();

  switch (screen) {
    case 'intro':
      return <IntroScreen />;
    case 'login':
      return <LoginScreen />;
    case 'menu':
      return <MenuScreen />;
    case 'mode-select':
      return <ModeSelectScreen />;
    case 'campaign':
      return <CampaignMapScreen />;
    case 'space-game':
      return <SpaceGameScreen />;
    case 'zombie-game':
      return <ZombieGameScreen />;
    case 'survival':
      return <SurvivalScreen />;
    case 'shop':
      return <ShopScreen />;
    case 'canjes':
      return <CanjesScreen />;
    case 'roulette':
      return <RouletteScreen />;
    case 'characters':
      return <CharactersScreen />;
    case 'ranking':
      return <RankingScreen />;
    case 'offerwall':
      return <OfferwallScreen />;
    case 'admin':
      return <AdminScreen />;
    case 'operator':
      return <OperatorScreen />;
    case 'influencer':
      return <InfluencerScreen />;
    case 'arcade':
      return <ArcadeHub />;
    case 'neon-maze':
      return <NeonMazeSurvival />;
    default:
      return <IntroScreen />;
  }
}

function BackButtonHandler() {
  const { screen, setScreen } = useGame();
  const lastBackPressRef = useRef<number>(0);
  const [showExitToast, setShowExitToast] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      const now = Date.now();
      if (GAMEPLAY_SCREENS.includes(screen)) {
        pauseAudio();
        setScreen('menu');
      } else if (screen === 'campaign') {
        setScreen('menu');
      } else if (MENU_SCREENS.includes(screen) && screen !== 'menu' && screen !== 'login' && screen !== 'intro') {
        setScreen('menu');
      } else if (screen === 'menu' || screen === 'login' || screen === 'intro') {
        if (now - lastBackPressRef.current < 2000) {
          window.close();
        } else {
          lastBackPressRef.current = now;
          setShowExitToast(true);
          setTimeout(() => setShowExitToast(false), 2000);
        }
      }
      // Push state so back button stays in app
      if (typeof history !== 'undefined') {
        history.pushState(null, '', window.location.href);
      }
    };

    // Listen for Capacitor/backbutton event
    const handleBackButton = () => handlePopState();

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('backbutton', handleBackButton as EventListener);

    // Initial push state
    if (typeof history !== 'undefined') {
      history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('backbutton', handleBackButton as EventListener);
    };
  }, [screen, setScreen]);

  if (!showExitToast) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl bg-card border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 animate-scale-in">
      <p className="text-white text-sm font-bold">Presione otra vez para salir</p>
    </div>
  );
}

function OrientationManager() {
  useEffect(() => {
    document.documentElement.style.setProperty('--app-rotation', '0deg');
  }, []);

  return null;
}

function AppShell() {
  const { screen, isDeviceBanned, canShowInterstitial, recordInterstitial, vip } = useGame();
  const isGameplay = GAMEPLAY_SCREENS.includes(screen);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [forceUpdate, setForceUpdate] = useState<{ minVersion: number; currentVersion: number } | null>(null);
  const lastScreenRef = useRef(screen);
  const lastInterstitialTimeRef = useRef<number>(0);
  const menuScreens = ['menu', 'shop', 'canjes', 'roulette', 'characters', 'ranking', 'offerwall', 'mode-select'];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await checkMinVersion();
        if (!cancelled && result.updateRequired) {
          setForceUpdate({ minVersion: result.minVersion, currentVersion: result.currentVersion });
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const fromMenu = menuScreens.includes(lastScreenRef.current);
    const toMenu = menuScreens.includes(screen);
    const isCampaignNav = CAMPAIGN_SCREENS.includes(screen) || CAMPAIGN_SCREENS.includes(lastScreenRef.current);
    const now = Date.now();
    const timeSinceLast = now - lastInterstitialTimeRef.current;
    if (fromMenu && toMenu && lastScreenRef.current !== screen && !vip && canShowInterstitial() && !isCampaignNav && timeSinceLast >= INTERSTITIAL_INTERVAL_MS) {
      setShowInterstitial(true);
      recordInterstitial();
      lastInterstitialTimeRef.current = now;
    }
    lastScreenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLast = now - lastInterstitialTimeRef.current;
      if (timeSinceLast >= INTERSTITIAL_INTERVAL_MS && !vip && !CAMPAIGN_SCREENS.includes(screen)) {
        const Capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
        const isNative = Capacitor?.isNativePlatform?.() ?? false;
        if (isNative && canShowInterstitial()) {
          setShowInterstitial(true);
          recordInterstitial();
          lastInterstitialTimeRef.current = now;
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [screen, vip, canShowInterstitial, recordInterstitial]);

  useEffect(() => {
    (async () => {
      try {
        const Capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
        const isNative = Capacitor?.isNativePlatform?.() ?? false;
        if (!isNative) return;
        await AdMob.initialize({ initializeForTesting: false });
      } catch {}
    })();
  }, []);

  // Wake Lock: keep screen on while in gameplay
  useEffect(() => {
    if (isGameplay) {
      acquireWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => { releaseWakeLock(); };
  }, [isGameplay]);

  // Capture referral code from URL on first load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        localStorage.setItem('garrdash_pending_referral', ref);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        pauseAudio();
      } else {
        resumeAudio();
        if (isGameplay) acquireWakeLock();
      }
    };
    const handleBlur = () => pauseAudio();
    const handleFocus = () => resumeAudio();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isGameplay]);

  if (isDeviceBanned) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background px-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-red-400 font-bold text-xl mb-2">Dispositivo suspendido permanentemente</h1>
        <p className="text-white/40 text-sm">Este dispositivo ha sido baneado por violar los terminos de servicio.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col">
      <div className="flex-1 relative overflow-hidden min-h-0">
        <GameRouter />
      </div>
      <AdBanner />
      <BackButtonHandler />
      <OrientationManager />
      {showInterstitial && <InterstitialAd onDone={() => setShowInterstitial(false)} />}
      {forceUpdate && <ForceUpdateModal minVersion={forceUpdate.minVersion} currentVersion={forceUpdate.currentVersion} />}
    </div>
  );
}

export default function GameApp() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}
