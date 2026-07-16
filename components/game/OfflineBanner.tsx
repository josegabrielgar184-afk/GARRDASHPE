'use client';

import { useGame } from '@/hooks/use-game';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline, pendingCoins } = useGame();
  if (isOnline) return null;

  return (
    <div className="offline-banner fixed top-0 left-0 right-0 z-50 px-3 py-2 flex items-center justify-center gap-2 text-white text-xs font-bold text-center border-b-2 border-red-500/50">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        MODO OFFLINE: Jugando de forma local. Los puntos y monedas
        {pendingCoins > 0 ? ` (${pendingCoins} pendientes)` : ''} NO se guardaran en el Ranking global hasta que te conectes a Internet.
      </span>
    </div>
  );
}
