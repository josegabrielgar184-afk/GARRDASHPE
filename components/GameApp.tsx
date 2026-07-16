'use client';

import { GameProvider, useGame } from '@/hooks/use-game';
import { IntroScreen } from '@/components/screens/IntroScreen';
import { LoginScreen } from '@/components/screens/LoginScreen';
import { MenuScreen } from '@/components/screens/MenuScreen';
import { ModeSelectScreen } from '@/components/screens/ModeSelectScreen';
import { SpaceGameScreen } from '@/components/screens/SpaceGameScreen';
import { ZombieGameScreen } from '@/components/screens/ZombieGameScreen';
import { ShopScreen } from '@/components/screens/ShopScreen';
import { RouletteScreen } from '@/components/screens/RouletteScreen';
import { CharactersScreen } from '@/components/screens/CharactersScreen';
import { RankingScreen } from '@/components/screens/RankingScreen';
import { AdBanner } from '@/components/game/AdBanner';

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
    case 'space-game':
      return <SpaceGameScreen />;
    case 'zombie-game':
      return <ZombieGameScreen />;
    case 'shop':
      return <ShopScreen />;
    case 'roulette':
      return <RouletteScreen />;
    case 'characters':
      return <CharactersScreen />;
    case 'ranking':
      return <RankingScreen />;
    default:
      return <IntroScreen />;
  }
}

export default function GameApp() {
  return (
    <GameProvider>
      <div className="fixed inset-0 overflow-hidden flex flex-col">
        <div className="flex-1 relative overflow-hidden min-h-0">
          <GameRouter />
        </div>
        <AdBanner />
      </div>
    </GameProvider>
  );
}
