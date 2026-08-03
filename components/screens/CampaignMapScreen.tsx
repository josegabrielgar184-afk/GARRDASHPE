'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import { ArrowLeft, Star, Lock, Key, Gem, Heart, Baby, Skull, Infinity as InfinityIcon, Trophy } from 'lucide-react';
import { TOTAL_CAMPAIGN_LEVELS, SPECIAL_LEVELS, getCampaignCoinReward } from '@/lib/config';

export function CampaignMapScreen() {
  const { setScreen, campaignProgress, completeLevel, coins, getCurrentCampaignLevel } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const currentLevel = campaignProgress.currentLevel;
  const maxUnlocked = currentLevel;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const targetLevel = currentLevel;
    const tileHeight = 80;
    const targetY = Math.floor(targetLevel / 3) * tileHeight;
    setTimeout(() => { el.scrollTo({ top: Math.max(0, targetY - el.clientHeight / 2), behavior: 'smooth' }); }, 200);
  }, [currentLevel]);

  const getLevelColor = (level: number): string => {
    const special = SPECIAL_LEVELS[level];
    if (special) return special.color;
    return '#22d3ee';
  };

  const isLevelUnlocked = (level: number): boolean => level <= maxUnlocked;

  const handlePlay = (level: number) => {
    if (!isLevelUnlocked(level)) return;
    setSelectedLevel(level);
    setScreen('zombie-game');
  };

  const renderLevelTile = (level: number) => {
    const unlocked = isLevelUnlocked(level);
    const stars = campaignProgress.stars[level] ?? 0;
    const special = SPECIAL_LEVELS[level];
    const color = getLevelColor(level);
    const isCurrent = level === currentLevel;

    return (
      <div key={level} className="flex items-center gap-3" style={{ minHeight: '70px' }}>
        {/* Path connector */}
        {level > 1 && (
          <div className="absolute left-1/2 -translate-x-1/2" style={{ marginTop: '-70px', height: '70px', width: '4px', background: unlocked ? `${color}44` : '#333' }} />
        )}
        <button
          onClick={() => unlocked && handlePlay(level)}
          disabled={!unlocked}
          className={`relative flex flex-col items-center justify-center rounded-2xl transition-all ${unlocked ? 'active:scale-95 cursor-pointer' : 'opacity-40'} ${isCurrent ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
          style={{
            width: 60, height: 60,
            background: unlocked ? `linear-gradient(135deg, ${color}33, ${color}11)` : '#1a1a1a',
            border: `2px solid ${unlocked ? color : '#333'}`,
            boxShadow: unlocked && !special ? `0 0 12px ${color}33` : special ? `0 0 20px ${color}66` : 'none',
          }}
        >
          {unlocked ? (
            <>
              <span className={`font-black text-lg ${level === 4 ? 'animate-blink-red' : (level === 10 || level === 30) ? 'animate-glow-white' : ''}`} style={{ color }}>{level}</span>
              {special && (
                <span className="absolute -top-2 -right-2">
                  {level === 4 ? <Heart className="w-4 h-4 text-red-500 fill-red-500" /> : <Baby className="w-4 h-4 text-white" />}
                </span>
              )}
              {!unlocked && <Lock className="w-4 h-4 text-white/30" />}
            </>
          ) : (
            <Lock className="w-5 h-5 text-white/30" />
          )}
        </button>
        {/* Stars */}
        {stars > 0 && (
          <div className="flex gap-0.5">
            {[1, 2, 3].map((s) => (
              <Star key={s} className={`w-3 h-3 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-white/15'}`} />
            ))}
          </div>
        )}
        {/* Special label */}
        {special && unlocked && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color, background: `${color}22`, border: `1px solid ${color}44` }}>
            {level === 4 ? 'AMOR' : 'BEBE'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20 relative overflow-hidden">
      <OfflineBanner />
      <MuteButton />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-gradient-to-b from-background to-transparent">
        <button onClick={() => setScreen('menu')} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/50 backdrop-blur text-white text-sm font-bold active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold">{campaignProgress.keys}</span>
          </div>
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
            <Gem className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-400 text-xs font-bold">{campaignProgress.diamondsClaimed ? '100' : '0'}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 text-center">
        <h1 className="text-white font-black text-lg">MAPA DE CAMPAÑA</h1>
        <p className="text-white/40 text-[10px]">Nivel {currentLevel} de {TOTAL_CAMPAIGN_LEVELS}</p>
      </div>

      {/* Camino del Vicio button */}
      <button
        onClick={() => setScreen('survival')}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 px-6 py-3 rounded-xl bg-gradient-to-r from-red-900/60 to-purple-900/60 border-2 border-red-500/40 text-red-400 font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
      >
        <Skull className="w-4 h-4" />
        EL CAMINO DEL VICIO
        <InfinityIcon className="w-4 h-4" />
      </button>

            {/* Scrollable map */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar pt-28 pb-44 px-4">
        <div className="flex flex-col items-center gap-0 max-w-sm mx-auto">
          {Array.from({ length: TOTAL_CAMPAIGN_LEVELS }, (_, i) => i + 1).map((level) => (
            <div key={level} className="w-full flex justify-center relative">
              {renderLevelTile(level)}
            </div>
          ))}
        </div>
      </div>

      {/* Level info modal */}
      {selectedLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedLevel(null)}>
          <div className="w-full max-w-xs mx-4 rounded-2xl bg-card border border-cyan-500/30 p-6 animate-scale-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-bold text-xl text-center mb-2">Nivel {selectedLevel}</h2>
            {SPECIAL_LEVELS[selectedLevel] && (
              <p className="text-center text-sm font-bold mb-2" style={{ color: SPECIAL_LEVELS[selectedLevel].color }}>
                {SPECIAL_LEVELS[selectedLevel].message}
              </p>
            )}
            <div className="text-center mb-4">
              <p className="text-white/40 text-xs">Recompensa: {getCampaignCoinReward(selectedLevel).min}-{getCampaignCoinReward(selectedLevel).max} monedas</p>
              <p className="text-white/40 text-xs mt-1">Llaves: {selectedLevel % 10 === 0 ? '+1 llave' : 'Sin llave'}</p>
            </div>
            <button
              onClick={() => { setScreen('zombie-game'); }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:opacity-90"
            >
              JUGAR NIVEL {selectedLevel}
            </button>
            <button onClick={() => setSelectedLevel(null)} className="w-full py-2 mt-2 text-white/40 text-sm hover:text-white">Cancelar</button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes blink-red {
          0%, 50%, 100% { opacity: 1; color: #ef4444; text-shadow: 0 0 15px #ef4444, 0 0 30px #ef4444; }
          25%, 75% { opacity: 0.3; color: #dc2626; }
        }
        .animate-blink-red { animation: blink-red 0.8s ease-in-out infinite; }
        @keyframes glow-white {
          0%, 100% { opacity: 1; color: #ffffff; text-shadow: 0 0 10px #ffffff, 0 0 20px #ffffff; }
          50% { opacity: 0.7; color: #f0f0f0; text-shadow: 0 0 20px #ffffff, 0 0 40px #ffffff; }
        }
        .animate-glow-white { animation: glow-white 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
