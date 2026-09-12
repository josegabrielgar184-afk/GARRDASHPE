'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import { ArrowLeft, Star, Lock, Key, Gem, Heart, Baby, Skull, Infinity as InfinityIcon, Trophy } from 'lucide-react';
import { TOTAL_CAMPAIGN_LEVELS, SPECIAL_LEVELS, getCampaignCoinReward } from '@/lib/config';

const TILE_H = 90;
const MAP_WIDTH = 320;
const ZIGZAG_AMPLITUDE = 80;

function getLevelX(level: number): number {
  const row = level - 1;
  const phase = (row % 4);
  const pattern = phase === 0 ? -1 : phase === 1 ? -0.3 : phase === 2 ? 1 : 0.3;
  return MAP_WIDTH / 2 + pattern * ZIGZAG_AMPLITUDE;
}

function getLevelY(level: number): number {
  return (level - 1) * TILE_H + TILE_H / 2;
}

export function CampaignMapScreen() {
  const { setScreen, campaignProgress, completeLevel, coins, getCurrentCampaignLevel } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const currentLevel = campaignProgress.currentLevel;
  const maxUnlocked = currentLevel;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const targetY = getLevelY(currentLevel);
    setTimeout(() => { el.scrollTo({ top: Math.max(0, targetY - el.clientHeight / 2), behavior: 'smooth' }); }, 200);
  }, [currentLevel]);

  const getLevelColor = (level: number): string => {
    const special = SPECIAL_LEVELS[level];
    if (special) return special.color;
    if (level >= 10) return '#22d3ee';
    return '#84cc16';
  };

  const isLevelUnlocked = (level: number): boolean => level <= maxUnlocked;

  const handlePlay = (level: number) => {
    if (!isLevelUnlocked(level)) return;
    setSelectedLevel(level);
    setScreen('zombie-game');
  };

  const totalHeight = TOTAL_CAMPAIGN_LEVELS * TILE_H;

  // Build SVG zig-zag path
  let pathD = '';
  for (let lvl = 1; lvl <= TOTAL_CAMPAIGN_LEVELS; lvl++) {
    const lx = getLevelX(lvl);
    const ly = getLevelY(lvl);
    if (lvl === 1) {
      pathD += `M ${lx} ${ly}`;
    } else {
      const prevX = getLevelX(lvl - 1);
      const prevY = getLevelY(lvl - 1);
      const midY = (prevY + ly) / 2;
      pathD += ` Q ${(prevX + lx) / 2} ${midY} ${lx} ${ly}`;
    }
  }

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

      {/* Scrollable map with SVG zig-zag path */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar pt-28 pb-44">
        <div className="relative mx-auto" style={{ width: MAP_WIDTH, height: totalHeight }}>
          {/* SVG path background */}
          <svg
            className="absolute inset-0"
            width={MAP_WIDTH}
            height={totalHeight}
            style={{ pointerEvents: 'none' }}
          >
            <path
              d={pathD}
              fill="none"
              stroke="rgba(132,204,22,0.2)"
              strokeWidth={6}
              strokeDasharray="8 6"
              strokeLinecap="round"
            />
            <path
              d={pathD}
              fill="none"
              stroke="rgba(132,204,22,0.08)"
              strokeWidth={14}
              strokeLinecap="round"
            />
          </svg>

          {/* Level buttons positioned along the zig-zag */}
          {Array.from({ length: TOTAL_CAMPAIGN_LEVELS }, (_, i) => i + 1).map((level) => {
            const lx = getLevelX(level);
            const ly = getLevelY(level);
            const unlocked = isLevelUnlocked(level);
            const stars = campaignProgress.stars[level] ?? 0;
            const special = SPECIAL_LEVELS[level];
            const color = getLevelColor(level);
            const isCurrent = level === currentLevel;

            return (
              <div
                key={level}
                className="absolute flex flex-col items-center"
                style={{
                  left: lx - 30,
                  top: ly - 30,
                  width: 60,
                  height: 60,
                }}
              >
                {/* Floating avatar on current level */}
                {isCurrent && (
                  <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 z-10"
                    style={{ animation: 'float-bob 2s ease-in-out infinite' }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white flex items-center justify-center shadow-lg shadow-amber-500/50">
                      <span className="text-white text-xs font-black">★</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => unlocked && handlePlay(level)}
                  disabled={!unlocked}
                  className={`relative flex items-center justify-center rounded-2xl transition-all ${unlocked ? 'active:scale-95 cursor-pointer' : 'opacity-40'} ${isCurrent ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
                  style={{
                    width: 54, height: 54,
                    background: unlocked ? `linear-gradient(135deg, ${color}33, ${color}11)` : '#1a1a1a',
                    border: `2px solid ${unlocked ? color : '#333'}`,
                    boxShadow: unlocked && !special ? `0 0 12px ${color}33` : special ? `0 0 20px ${color}66` : 'none',
                  }}
                >
                  {unlocked ? (
                    <>
                      <span className={`font-black text-base ${level === 4 ? 'animate-blink-red' : (level === 10 || level === 30) ? 'animate-glow-white' : ''}`} style={{ color }}>{level}</span>
                      {special && (
                        <span className="absolute -top-2 -right-2">
                          {level === 4 ? <Heart className="w-4 h-4 text-red-500 fill-red-500" /> : <Baby className="w-4 h-4 text-white" />}
                        </span>
                      )}
                    </>
                  ) : (
                    <Lock className="w-5 h-5 text-white/30" />
                  )}
                </button>

                {/* Stars */}
                {stars > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3].map((s) => (
                      <Star key={s} className={`w-2.5 h-2.5 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-white/15'}`} />
                    ))}
                  </div>
                )}

                {/* Biome label */}
                {unlocked && level === 10 && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-1" style={{ color: '#22d3ee', background: '#22d3ee22', border: '1px solid #22d3ee44' }}>
                    RIO
                  </span>
                )}
                {unlocked && level === 1 && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-1" style={{ color: '#84cc16', background: '#84cc1622', border: '1px solid #84cc1644' }}>
                    RUTA
                  </span>
                )}
              </div>
            );
          })}
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
              <p className="text-white/40 text-xs mt-1">Bioma: {selectedLevel >= 10 ? 'Rio de Combate' : 'Carretera Militar'}</p>
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
        @keyframes float-bob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
