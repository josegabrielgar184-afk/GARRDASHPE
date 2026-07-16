'use client';

import { useGame } from '@/hooks/use-game';
import { Volume2, VolumeX } from 'lucide-react';

export function MuteButton() {
  const { muted, toggleMute } = useGame();
  return (
    <button
      onClick={toggleMute}
      className="fixed top-3 left-3 z-50 w-10 h-10 rounded-full bg-card/80 backdrop-blur border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
      aria-label={muted ? 'Activar música' : 'Silenciar música'}
    >
      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </button>
  );
}
