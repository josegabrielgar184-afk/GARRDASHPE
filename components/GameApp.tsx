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
import { CharactersScreen } from '@/components/screens/CharactersScreen';
import { RankingScreen } from '@/components/screens/RankingScreen';
import { OfferwallScreen } from '@/components/screens/OfferwallScreen';
import { AdminScreen } from '@/components/screens/AdminScreen';
import { OperatorScreen } from '@/components/screens/OperatorScreen';
import { InfluencerScreen } from '@/components/screens/InfluencerScreen';
import { AdBanner } from '@/components/game/AdBanner';
import { InterstitialAd } from '@/components/game/InterstitialAd';
import { pauseAudio, resumeAudio } from '@/lib/audio';

const GAMEPLAY_SCREENS = ['space-game', 'zombie-game', 'survival'];
const MENU_SCREENS = ['menu', 'login', 'intro', 'mode-select', 'campaign', 'shop', 'roulette', 'characters', 'ranking', 'offerwall', 'admin', 'operator', 'influencer'];

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
  const { screen, orientationMode } = useGame();

  useEffect(() => {
    if (typeof screen === 'undefined') return;

    const isGameplay = GAMEPLAY_SCREENS.includes(screen);

    if (orientationMode === 'portrait') {
      document.documentElement.style.setProperty('--app-rotation', '0deg');
      return;
    }
    if (orientationMode === 'landscape') {
      document.documentElement.style.setProperty('--app-rotation', '90deg');
      return;
    }

    // auto mode: gameplay = landscape, menus = portrait
    document.documentElement.style.setProperty('--app-rotation', isGameplay ? '90deg' : '0deg');
  }, [screen, orientationMode]);

  return null;
}

function AppShell() {
  const { screen, isDeviceBanned, canShowInterstitial, recordInterstitial, vip } = useGame();
  const isGameplay = GAMEPLAY_SCREENS.includes(screen);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const lastScreenRef = useRef(screen);
  const menuScreens = ['menu', 'shop', 'roulette', 'characters', 'ranking', 'offerwall', 'mode-select'];

  useEffect(() => {
    const fromMenu = menuScreens.includes(lastScreenRef.current);
    const toMenu = menuScreens.includes(screen);
    if (fromMenu && toMenu && lastScreenRef.current !== screen && !vip && canShowInterstitial()) {
      setShowInterstitial(true);
      recordInterstitial();
    }
    lastScreenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    // Initialize AdMob SDK on native platforms
    (async () => {
      try {
        const Capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
        const isNative = Capacitor?.isNativePlatform?.() ?? false;
        if (!isNative) return;
        const mod = await (eval('import')('@capacitor-community/admob'));
        const AdMob = (mod as unknown as { AdMob: { initialize: (opts: Record<string, unknown>) => Promise<void> } }).AdMob;
        if (AdMob) await AdMob.initialize({ requestTrackingAuthorization: true });
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        pauseAudio();
      } else {
        resumeAudio();
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
  }, []);

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
      <div className="flex-1 relative overflow-hidden min-h-0" style={{ paddingBottom: '50px' }}>
        <GameRouter />
      </div>
      <AdBanner />
      <BackButtonHandler />
      <OrientationManager />
      {showInterstitial && <InterstitialAd onDone={() => setShowInterstitial(false)} />}
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
