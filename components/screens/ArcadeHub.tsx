'use client';

import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import {
  Skull, Infinity as InfinityIcon, Zap, Trophy, Coins, ShoppingBag,
  Star, ChevronRight, Gamepad2, Crown, ArrowLeft,
} from 'lucide-react';

export function ArcadeHub() {
  const { setScreen, userRole, coins, points, playerName } = useGame();

  return (
    <div className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden">
      <MuteButton />

      {/* Neon grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,243,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-16 px-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setScreen('menu')} className="flex items-center gap-1.5 text-white/50 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Volver</span>
          </button>
          <h1 className="text-[#00f3ff] font-black text-lg tracking-wider" style={{ textShadow: '0 0 10px rgba(0,243,255,0.5)' }}>
            ARCADE HUB
          </h1>
          <div className="w-20" />
        </div>

        {/* User stats bar */}
        <div className="flex items-center gap-3 rounded-2xl bg-black/40 border border-[#00f3ff]/20 p-3 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f3ff]/30 to-[#0a0e17] border border-[#00f3ff]/40 flex items-center justify-center shrink-0">
            <span className="text-[#00f3ff] font-black text-lg">{(playerName ?? 'P')[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{playerName || 'Jugador'}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Coins className="w-3.5 h-3.5" /> {coins.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-[#ffb700] text-xs font-bold">
                <Trophy className="w-3.5 h-3.5" /> {points.toLocaleString()}
              </span>
            </div>
          </div>
          {userRole === 'admin' && (
            <button onClick={() => setScreen('admin')} className="px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-colors">
              Admin
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-4 pb-24 space-y-4">
        {/* Featured card: Camino del Vicio */}
        <button
          onClick={() => setScreen('survival')}
          className="w-full rounded-3xl bg-gradient-to-br from-red-900/40 via-[#0a0e17] to-purple-900/30 border-2 border-red-500/40 p-6 text-left active:scale-[0.98] transition-transform shadow-lg shadow-red-500/10"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-red-400 text-[10px] font-black tracking-widest uppercase mb-1">Destacado</p>
              <h2 className="text-white font-black text-2xl" style={{ textShadow: '0 0 15px rgba(239,68,68,0.4)' }}>
                EL CAMINO DEL VICIO
              </h2>
              <p className="text-white/40 text-xs mt-1">Supervivencia Zombi infinita</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <Skull className="w-7 h-7 text-red-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold">SURVIVAL</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">+Monedas</span>
            <InfinityIcon className="w-4 h-4 text-red-400/60" />
          </div>
          <div className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-center text-sm tracking-wide active:scale-95 transition-transform">
            ¡JUGAR SUPERVIVENCIA!
          </div>
        </button>

        {/* Card 2: Laberinto Neon */}
        <button
          onClick={() => setScreen('neon-maze')}
          className="w-full rounded-3xl bg-gradient-to-br from-[#00f3ff]/10 via-[#0a0e17] to-[#ffb700]/5 border-2 border-[#00f3ff]/30 p-6 text-left active:scale-[0.98] transition-transform shadow-lg shadow-[#00f3ff]/10"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[#00f3ff] text-[10px] font-black tracking-widest uppercase mb-1">Nuevo</p>
              <h2 className="text-white font-black text-2xl" style={{ textShadow: '0 0 15px rgba(0,243,255,0.4)' }}>
                LABERINTO NEON
              </h2>
              <p className="text-white/40 text-xs mt-1">Esquiva zombis, recolecta monedas doradas</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#00f3ff]/15 border border-[#00f3ff]/40 flex items-center justify-center shrink-0">
              <Zap className="w-7 h-7 text-[#00f3ff]" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[#00f3ff] text-[10px] font-bold">ARCADE</span>
            <span className="px-2 py-0.5 rounded-full bg-[#ffb700]/10 border border-[#ffb700]/30 text-[#ffb700] text-[10px] font-bold">+100 pts Ranking</span>
          </div>
          <div className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00f3ff] to-cyan-400 text-black font-black text-center text-sm tracking-wide active:scale-95 transition-transform">
            ENTRAR AL LABERINTO
          </div>
        </button>

        {/* Secondary access: Campaign */}
        <button
          onClick={() => setScreen('campaign')}
          className="w-full flex items-center justify-between rounded-2xl bg-black/30 border border-white/10 p-4 text-left active:scale-[0.98] transition-transform hover:border-white/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white/40" />
            </div>
            <div>
              <p className="text-white/70 font-bold text-sm">Modo Historia / Campana Clasica</p>
              <p className="text-white/30 text-xs">Niveles progresivos con jefes</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/30" />
        </button>

        {/* Footer: quick access buttons */}
        <div className="grid grid-cols-4 gap-3 pt-2">
          <button onClick={() => setScreen('shop')} className="flex flex-col items-center gap-1.5 rounded-2xl bg-black/30 border border-white/10 p-3 hover:border-[#00f3ff]/30 transition-colors active:scale-95">
            <ShoppingBag className="w-6 h-6 text-[#00f3ff]" />
            <span className="text-white/60 text-[10px] font-bold">Tienda</span>
          </button>
          <button onClick={() => setScreen('ranking')} className="flex flex-col items-center gap-1.5 rounded-2xl bg-black/30 border border-white/10 p-3 hover:border-[#ffb700]/30 transition-colors active:scale-95">
            <Trophy className="w-6 h-6 text-[#ffb700]" />
            <span className="text-white/60 text-[10px] font-bold">Ranking</span>
          </button>
          <button onClick={() => setScreen('roulette')} className="flex flex-col items-center gap-1.5 rounded-2xl bg-black/30 border border-white/10 p-3 hover:border-amber-400/30 transition-colors active:scale-95">
            <Star className="w-6 h-6 text-amber-400" />
            <span className="text-white/60 text-[10px] font-bold">Ruleta</span>
          </button>
          {userRole === 'admin' && (
            <button onClick={() => setScreen('admin')} className="flex flex-col items-center gap-1.5 rounded-2xl bg-black/30 border border-white/10 p-3 hover:border-amber-400/30 transition-colors active:scale-95">
              <Crown className="w-6 h-6 text-amber-400" />
              <span className="text-white/60 text-[10px] font-bold">Admin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
