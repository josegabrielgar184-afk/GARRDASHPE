'use client';

import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { ArrowLeft, Skull, Map, Infinity as InfinityIcon } from 'lucide-react';
import { useState } from 'react';

export function ModeSelectScreen() {
  const { setScreen } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <MuteButton />
      <SuggestionButton onClick={() => setShowSuggestion(true)} />

      <div className="pt-16 px-6 pb-28 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-white font-bold text-xl">Modo de Juego</h1>
        </div>

        <div className="space-y-4 flex-1">
          <button onClick={() => setScreen('campaign')} className="w-full rounded-2xl bg-gradient-to-br from-cyan-900/40 to-gray-900 border border-cyan-500/30 p-6 text-left hover:bg-cyan-500/10 transition-colors shadow-lg shadow-cyan-500/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/20"><Map className="w-7 h-7 text-cyan-400" /></div>
              <div>
                <h2 className="text-white font-bold text-lg">Camapaña 999 Niveles</h2>
                <p className="text-white/50 text-sm">Mapa visual con casillas del 1 al 999</p>
                <p className="text-cyan-400/60 text-xs mt-1">Niveles especiales 4, 10 y 30 · Llaves cada 10 niveles</p>
              </div>
            </div>
          </button>

          <button onClick={() => setScreen('survival')} className="w-full rounded-2xl bg-gradient-to-br from-red-900/40 to-purple-900/40 border border-red-500/30 p-6 text-left hover:bg-red-500/10 transition-colors shadow-lg shadow-red-500/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/20"><Skull className="w-7 h-7 text-red-400" /></div>
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">El Camino del Vicio <InfinityIcon className="w-4 h-4 text-red-400" /></h2>
                <p className="text-white/50 text-sm">Supervivencia infinita para farmear monedas</p>
                <p className="text-red-400/60 text-xs mt-1">Zombis y cajitas sin parar · Ranking de supervivencia</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />
    </div>
  );
}
