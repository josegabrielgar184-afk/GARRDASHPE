'use client';

import { useGame } from '@/hooks/use-game';
import { Trophy } from 'lucide-react';

export function TopBar() {
  const { topPlayerName, topPlayerScore } = useGame();
  return (
    <div className="w-full bg-gradient-to-r from-amber-900/40 via-amber-800/30 to-amber-900/40 border-y border-amber-500/30 px-4 py-2 flex items-center gap-2">
      <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
      <span className="text-amber-300 text-xs font-bold">TOP 1 RÉCORD GLOBAL</span>
      <span className="text-white/80 text-xs font-mono ml-auto">
        {topPlayerName}: <span className="text-amber-400 font-bold">{topPlayerScore.toLocaleString()}</span> pts
      </span>
    </div>
  );
}
