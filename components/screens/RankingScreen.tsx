'use client';

import { useEffect, useState, useRef } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { ArrowLeft, Trophy, Medal, RefreshCw, Rocket, Skull, Radio, ChevronDown, Crown, Calendar, Globe, User } from 'lucide-react';

export function RankingScreen() {
  const {
    setScreen, spaceRanking, zombieRanking, weeklyRanking, refreshRanking, refreshWeeklyRanking,
    loadMoreRanking, hasMoreRanking, playerName, currentUserRank,
  } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [mainTab, setMainTab] = useState<'weekly' | 'global'>('weekly');
  const [gameTab, setGameTab] = useState<'space' | 'zombie'>('space');
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(15);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([refreshRanking(), refreshWeeklyRanking()]).finally(() => setLoading(false));
  }, [refreshRanking, refreshWeeklyRanking]);

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 15 : c - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setShowArrow(el.scrollHeight > el.clientHeight + 10 && el.scrollTop < el.scrollHeight - el.clientHeight - 10);
    };
    check();
    el.addEventListener('scroll', check);
    return () => el.removeEventListener('scroll', check);
  }, [loading, mainTab, gameTab]);

  const ranking = mainTab === 'weekly' ? weeklyRanking : (gameTab === 'space' ? spaceRanking : zombieRanking);
  const getMedalColor = (i: number) => i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-white/30';

  const handleLoadMore = async () => {
    if (mainTab === 'weekly') {
      await loadMoreRanking('weekly');
    } else {
      await loadMoreRanking(gameTab);
    }
  };

  const canLoadMore = mainTab === 'weekly' ? hasMoreRanking('weekly') : hasMoreRanking(gameTab);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <MuteButton />
      <SuggestionButton onClick={() => setShowSuggestion(true)} />

      <div className="pt-16 px-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-xl">RANKINGS</h1>
        </div>

        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
              <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-bold">EN VIVO</span>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-white/50 text-xs font-mono">{countdown}s</span>
            </div>
          </div>

          {/* Main tabs: Weekly / Global */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => setMainTab('weekly')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 ${mainTab === 'weekly' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'bg-card border border-border text-white/50'}`}>
              <Calendar className="w-4 h-4" />Top Semanal
            </button>
            <button onClick={() => setMainTab('global')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 ${mainTab === 'global' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10' : 'bg-card border border-border text-white/50'}`}>
              <Globe className="w-4 h-4" />Top Global
            </button>
          </div>

          {/* Game tabs - only for Global */}
          {mainTab === 'global' && (
            <div className="flex gap-2 mb-4">
              <button onClick={() => setGameTab('space')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${gameTab === 'space' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-card border border-border text-white/50'}`}>
                <Rocket className="w-3.5 h-3.5" />Espacio
              </button>
              <button onClick={() => setGameTab('zombie')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${gameTab === 'zombie' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-card border border-border text-white/50'}`}>
                <Skull className="w-3.5 h-3.5" />Zombies
              </button>
            </div>
          )}

          {mainTab === 'weekly' && (
            <div className="text-center mb-3">
              <p className="text-white/40 text-xs">Reinicio dominical · Premios automaticos para el TOP 3</p>
            </div>
          )}
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
          ) : ranking.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Trophy className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No hay datos aun esta semana</p>
            </div>
          ) : (
            <div ref={scrollRef} className="h-full overflow-y-auto no-scrollbar space-y-2 pb-4">
              {ranking.map((entry, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-xl p-3 border transition-all animate-fade-in ${i < 3 ? 'bg-gradient-to-r from-amber-900/20 to-card border-amber-500/30 shadow-lg shadow-amber-500/10' : 'bg-card border-border'}`}>
                  <div className="flex items-center justify-center w-8">
                    {i < 3 ? <Medal className={`w-6 h-6 ${getMedalColor(i)}`} /> : <span className="text-white/30 font-bold text-sm">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${i === 0 ? 'text-amber-400' : 'text-white'}`}>{entry.name}</p>
                    {i === 0 && mainTab === 'weekly' && <p className="text-amber-300/60 text-[10px]">Reino semanal</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-sm ${mainTab === 'global' ? (gameTab === 'space' ? 'text-cyan-400' : 'text-red-400') : 'text-amber-400'}`}>{entry.score.toLocaleString()}</p>
                    <p className="text-white/30 text-[10px]">{mainTab === 'global' ? (gameTab === 'space' ? 'puntos' : 'bajas') : 'puntos'}</p>
                  </div>
                </div>
              ))}
              {canLoadMore && (
                <button onClick={handleLoadMore} className="w-full py-3 rounded-xl bg-card border border-border text-white/50 text-xs font-bold flex items-center justify-center gap-2 hover:bg-secondary/30">
                  <ChevronDown className="w-4 h-4" />Cargar mas
                </button>
              )}
            </div>
          )}
          {showArrow && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce">
              <ChevronDown className="w-6 h-6 text-cyan-400/70" />
            </div>
          )}
        </div>
      </div>

      {/* Fixed user card at bottom */}
      <div className="px-6 pb-28 pt-2 flex-shrink-0">
        <div className="max-w-sm mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-cyan-900/30 to-card border border-cyan-500/30 p-3 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{playerName || 'Invitado'}</p>
              <p className="text-white/40 text-xs">Tu posicion en el ranking</p>
            </div>
            <div className="text-right shrink-0">
              {currentUserRank ? (
                <p className="text-cyan-400 font-bold text-lg">#{currentUserRank}</p>
              ) : (
                <p className="text-white/30 text-sm">Sin ranking</p>
              )}
            </div>
          </div>
          <button onClick={() => { setLoading(true); Promise.all([refreshRanking(), refreshWeeklyRanking()]).finally(() => setLoading(false)); setCountdown(15); }} className="w-full mt-2 py-2.5 rounded-xl bg-card border border-border text-white/60 text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary">
            <RefreshCw className="w-4 h-4" />Actualizar ahora
          </button>
        </div>
      </div>

      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />
    </div>
  );
}
