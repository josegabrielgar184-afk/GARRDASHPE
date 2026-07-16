'use client';

import { useEffect, useState, useRef } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { ArrowLeft, Trophy, Medal, RefreshCw, Rocket, Skull, Radio, ChevronDown } from 'lucide-react';

export function RankingScreen() {
  const { setScreen, spaceRanking, zombieRanking, refreshRanking } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [tab, setTab] = useState<'space' | 'zombie'>('space');
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    setLoading(true);
    refreshRanking().finally(() => setLoading(false));
  }, [refreshRanking]);

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 10 : c - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Show scroll arrow if content overflows
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setShowArrow(el.scrollHeight > el.clientHeight + 10 && el.scrollTop < el.scrollHeight - el.clientHeight - 10);
    };
    check();
    el.addEventListener('scroll', check);
    return () => el.removeEventListener('scroll', check);
  }, [loading, tab]);

  const ranking = tab === 'space' ? spaceRanking : zombieRanking;
  const getMedalColor = (i: number) => i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-white/30';

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <MuteButton />
      <SuggestionButton onClick={() => setShowSuggestion(true)} />

      <div className="pt-16 px-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-xl">TOP 10 MEJORES</h1>
        </div>

        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
              <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-bold">EN VIVO</span>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-white/50 text-xs font-mono">Actualiza en {countdown}s</span>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setTab('space')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 ${tab === 'space' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'bg-card border border-border text-white/50'}`}>
              <Rocket className="w-4 h-4" />Espacio
            </button>
            <button onClick={() => setTab('zombie')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 ${tab === 'zombie' ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/10' : 'bg-card border border-border text-white/50'}`}>
              <Skull className="w-4 h-4" />Zombies
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable ranking list */}
      <div className="flex-1 min-h-0 px-6 overflow-hidden relative">
        <div className="max-w-sm mx-auto h-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-white/40 text-sm">Consultando Firebase...</p>
            </div>
          ) : (
            <div ref={scrollRef} className="h-full overflow-y-auto no-scrollbar space-y-2 pb-4">
              {ranking.map((entry, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-xl p-3 border transition-all animate-fade-in ${i < 3 ? 'bg-gradient-to-r from-amber-900/20 to-card border-amber-500/30 shadow-lg shadow-amber-500/10' : 'bg-card border-border'}`}>
                  <div className="flex items-center justify-center w-8">
                    {i < 3 ? <Medal className={`w-6 h-6 ${getMedalColor(i)}`} /> : <span className="text-white/30 font-bold text-sm">{i + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${i === 0 ? 'text-amber-400' : 'text-white'}`}>{entry.name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${tab === 'space' ? 'text-cyan-400' : 'text-red-400'}`}>{entry.score.toLocaleString()}</p>
                    <p className="text-white/30 text-[10px]">{tab === 'space' ? 'puntos' : 'bajas'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Animated down arrow indicator */}
          {showArrow && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce">
              <ChevronDown className="w-6 h-6 text-cyan-400/70" />
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-28 pt-2 flex-shrink-0">
        <div className="max-w-sm mx-auto">
          <button onClick={() => { setLoading(true); refreshRanking().finally(() => setLoading(false)); setCountdown(10); }} className="w-full py-2.5 rounded-xl bg-card border border-border text-white/60 text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary">
            <RefreshCw className="w-4 h-4" />Actualizar ahora
          </button>
        </div>
      </div>

      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />
    </div>
  );
}
