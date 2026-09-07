'use client';

import { useEffect, useState, useRef } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { ArrowLeft, Trophy, Medal, RefreshCw, Rocket, Skull, Radio, ChevronDown, Crown, Calendar, Globe, User, Heart, Baby, Infinity as InfinityIcon, History } from 'lucide-react';

export function RankingScreen() {
  const {
    setScreen, spaceRanking, zombieRanking, weeklyRanking, refreshRanking, refreshWeeklyRanking,
    loadMoreRanking, hasMoreRanking, playerName, currentUserRank, currentUserScore,
  } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [mainTab, setMainTab] = useState<'weekly' | 'global' | 'survival' | 'monthly'>('weekly');
  const [gameTab, setGameTab] = useState<'space' | 'zombie'>('space');
  const [loading, setLoading] = useState(false);
  const [monthlyChampions, setMonthlyChampions] = useState<Array<{ name: string; score: number; month: string }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [mainTab, gameTab]);

  useEffect(() => {
    if (mainTab === 'monthly') {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('monthlyChampions') : null;
      if (stored) {
        try { setMonthlyChampions(JSON.parse(stored)); } catch {}
      }
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const now = new Date();
      const currentMonth = `${months[now.getMonth()]} ${now.getFullYear()}`;
      if (weeklyRanking.length > 0 && weeklyRanking[0]) {
        const champ = { name: weeklyRanking[0].name, score: weeklyRanking[0].score, month: currentMonth };
        setMonthlyChampions((prev) => {
          const filtered = prev.filter((c) => c.month !== currentMonth);
          const updated = [champ, ...filtered].slice(0, 12);
          if (typeof window !== 'undefined') localStorage.setItem('monthlyChampions', JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [mainTab, weeklyRanking]);

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

  const ranking = mainTab === 'weekly' ? weeklyRanking : mainTab === 'survival' ? (zombieRanking) : mainTab === 'monthly' ? [] : (gameTab === 'space' ? spaceRanking : zombieRanking);
  const getMedalColor = (i: number) => i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-white/30';

  const handleLoadMore = async () => {
    if (mainTab === 'weekly') {
      await loadMoreRanking('weekly');
    } else {
      await loadMoreRanking(gameTab);
    }
  };

  const canLoadMore = mainTab === 'weekly' ? hasMoreRanking('weekly') : mainTab === 'survival' || mainTab === 'monthly' ? false : hasMoreRanking(gameTab);

  const getLevelColor = (level: number): string | null => {
    if (level === 4) return '#ef4444';
    if (level === 10 || level === 30) return '#ffffff';
    return null;
  };

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
              <span className="text-green-400 text-xs font-bold">TIEMPO REAL</span>
            </div>
          </div>

          {/* Main tabs: Weekly / Global / Monthly / Survival */}
          <div className="flex gap-1.5 mb-3">
            <button onClick={() => setMainTab('weekly')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 ${mainTab === 'weekly' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'bg-card border border-border text-white/50'}`}>
              <Calendar className="w-3.5 h-3.5" />Semanal
            </button>
            <button onClick={() => setMainTab('global')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 ${mainTab === 'global' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10' : 'bg-card border border-border text-white/50'}`}>
              <Globe className="w-3.5 h-3.5" />Global
            </button>
            <button onClick={() => setMainTab('monthly')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 ${mainTab === 'monthly' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-lg shadow-purple-500/10' : 'bg-card border border-border text-white/50'}`}>
              <History className="w-3.5 h-3.5" />Mensual
            </button>
            <button onClick={() => setMainTab('survival')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 ${mainTab === 'survival' ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/10' : 'bg-card border border-border text-white/50'}`}>
              <InfinityIcon className="w-3.5 h-3.5" />Superv.
            </button>
          </div>

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

          {mainTab === 'monthly' && (
            <div className="text-center mb-3">
              <p className="text-purple-400/60 text-xs flex items-center justify-center gap-1"><History className="w-3 h-3" /> Histórico de Campeones Mensuales — #1 de cada mes</p>
            </div>
          )}
          {mainTab === 'survival' && (
            <div className="text-center mb-3">
              <p className="text-red-400/60 text-xs flex items-center justify-center gap-1"><Skull className="w-3 h-3" /> Ranking del Camino del Vicio - Mejores tiempos de supervivencia</p>
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
          ) : mainTab === 'monthly' ? (
            monthlyChampions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Crown className="w-10 h-10 text-white/20 mb-3" />
                <p className="text-white/40 text-sm font-bold mb-1">Sin campeones registrados</p>
                <p className="text-white/30 text-xs">Los campeones mensuales aparecerán aquí automáticamente</p>
              </div>
            ) : (
              <div ref={scrollRef} className="h-full overflow-y-auto no-scrollbar space-y-2 pb-4">
                {monthlyChampions.map((champ, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-xl p-3 border transition-all animate-fade-in ${i === 0 ? 'bg-gradient-to-r from-purple-900/30 to-card border-purple-500/40 shadow-lg shadow-purple-500/10' : 'bg-card border-border'}`}>
                    <div className="flex items-center justify-center w-8">
                      {i === 0 ? <Crown className="w-6 h-6 text-purple-400" /> : <span className="text-white/30 font-bold text-sm">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${i === 0 ? 'text-purple-400' : 'text-white'}`}>{champ.name}</p>
                      <p className="text-white/30 text-[10px]">{champ.month}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-purple-400">{champ.score.toLocaleString()}</p>
                      <p className="text-white/30 text-[10px]">puntos</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : ranking.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Trophy className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white/40 text-sm font-bold mb-1">Aun no hay puntajes</p>
              <p className="text-white/30 text-xs">Sé el primero en calificar{mainTab === 'weekly' ? ' esta semana' : ''}</p>
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
                    {entry.level === 4 && <span className="text-red-400 text-[10px] font-bold flex items-center gap-0.5"><Heart className="w-2.5 h-2.5 fill-red-400" /> Nivel 4 - Amor</span>}
                    {(entry.level === 10 || entry.level === 30) && <span className="text-white text-[10px] font-bold flex items-center gap-0.5"><Baby className="w-2.5 h-2.5" /> Nivel {entry.level} - Bebe</span>}
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
                <div>
                  <p className="text-cyan-400 font-bold text-lg">#{currentUserRank}</p>
                  <p className="text-white/50 text-xs">{currentUserScore.toLocaleString()} puntos</p>
                </div>
              ) : (
                <div>
                  <p className="text-white/30 text-sm">Juega para entrar al ranking</p>
                  <p className="text-white/20 text-xs">Juega una partida para aparecer aqui</p>
                </div>
              )}
            </div>
          </div>
          <p className="text-white/30 text-[10px] text-center mt-2">Los puntajes se actualizan automaticamente</p>
        </div>
      </div>

      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />
    </div>
  );
}
