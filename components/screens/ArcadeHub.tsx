'use client';

import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import {
  Zap, Trophy, Coins, ShoppingBag, Star, Gamepad2, Crown, ArrowLeft,
  Lock, Rocket, ShieldAlert,
} from 'lucide-react';

export function ArcadeHub() {
  const { setScreen, userRole, coins, points, playerName } = useGame();

  return (
    <div className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden">
      <MuteButton />

      {/* Neon grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,243,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-16 px-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setScreen('menu')}
            className="flex items-center gap-1.5 text-white/50 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Volver</span>
          </button>
          <h1
            className="text-[#00f3ff] font-black text-lg tracking-wider"
            style={{ textShadow: '0 0 10px rgba(0,243,255,0.5)' }}
          >
            ARCADE HUB
          </h1>
          <div className="w-20" />
        </div>

        {/* User stats bar */}
        <div className="flex items-center gap-3 rounded-2xl bg-black/40 border border-[#00f3ff]/20 p-3 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f3ff]/30 to-[#0a0e17] border border-[#00f3ff]/40 flex items-center justify-center shrink-0">
            <span className="text-[#00f3ff] font-black text-lg">
              {(playerName ?? 'P')[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">
              {playerName || 'Jugador'}
            </p>
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
            <button
              onClick={() => setScreen('admin')}
              className="px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-colors"
            >
              Admin
            </button>
          )}
        </div>
      </div>

      {/* Main content: Exclusivo Minijuegos Arcade */}
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-4 pb-24 space-y-4">
        {/* Card 1: Laberinto Neon */}
        <button
          onClick={() => setScreen('neon-maze')}
          className="w-full rounded-3xl bg-gradient-to-br from-[#00f3ff]/10 via-[#0a0e17] to-[#ffb700]/5 border-2 border-[#00f3ff]/30 p-5 text-left active:scale-[0.98] transition-transform shadow-lg shadow-[#00f3ff]/10"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[#00f3ff] text-[10px] font-black tracking-widest uppercase mb-1">
                Disponible
              </p>
              <h2
                className="text-white font-black text-xl"
                style={{ textShadow: '0 0 15px rgba(0,243,255,0.4)' }}
              >
                LABERINTO NEON
              </h2>
              <p className="text-white/40 text-xs mt-1">
                Esquiva zombis y recolecta monedas doradas
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#00f3ff]/15 border border-[#00f3ff]/40 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-[#00f3ff]" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[#00f3ff] text-[10px] font-bold">
              ARCADE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#ffb700]/10 border border-[#ffb700]/30 text-[#ffb700] text-[10px] font-bold">
              +100 pts Ranking
            </span>
          </div>
          <div className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f3ff] to-cyan-400 text-black font-black text-center text-xs tracking-wide active:scale-95 transition-transform">
            ENTRAR AL LABERINTO
          </div>
        </button>

        {/* Card 2: GarrFly */}
        <button
          onClick={() => setScreen('garrfly')}
          className="w-full rounded-3xl bg-gradient-to-br from-amber-500/10 via-[#0a0e17] to-amber-900/20 border-2 border-amber-500/30 p-5 text-left active:scale-[0.98] transition-transform shadow-lg shadow-amber-500/10"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-amber-400 text-[10px] font-black tracking-widest uppercase mb-1">
                Nuevo Minijuego
              </p>
              <h2
                className="text-white font-black text-xl"
                style={{ textShadow: '0 0 15px rgba(245,158,11,0.4)' }}
              >
                GARRFLY
              </h2>
              <p className="text-white/40 text-xs mt-1">
                Vuela entre obstáculos y tuberías neón
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
              HABILIDAD
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-bold">
              +Monedas
            </span>
          </div>
          <div className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-center text-xs tracking-wide active:scale-95 transition-transform">
            JUGAR GARRFLY
          </div>
        </button>

        {/* Card 3: Z-Runner */}
        <div className="w-full rounded-3xl bg-black/40 border border-white/10 p-5 text-left opacity-70">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white/40 text-[10px] font-black tracking-widest uppercase mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Próximamente
              </p>
              <h2 className="text-white/80 font-black text-xl">Z-RUNNER</h2>
              <p className="text-white/30 text-xs mt-1">
                Carrera continua esquivando hordas en 3 carriles
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-white/30" />
            </div>
          </div>
          <div className="w-full py-3 rounded-xl bg-white/5 text-white/30 font-bold text-center text-xs">
            BLOQUEADO
          </div>
        </div>

        {/* Card 4: Astro Defense */}
        <div className="w-full rounded-3xl bg-black/40 border border-white/10 p-5 text-left opacity-70">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white/40 text-[10px] font-black tracking-widest uppercase mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Próximamente
              </p>
              <h2 className="text-white/80 font-black text-xl">ASTRO DEFENSE</h2>
              <p className="text-white/30 text-xs mt-1">
                Dispara a las oleadas espaciales desde tu nave
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Rocket className="w-6 h-6 text-white/30" />
            </div>
          </div>
          <div className="w-full py-3 rounded-xl bg-white/5 text-white/30 font-bold text-center text-xs">
            BLOQUEADO
          </div>
        </div>

        {/* Footer: quick access buttons */}
        <div className="grid grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => setScreen('shop')}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-black/30 border border-white/10 p-3 hover:border-[#00f3ff]/30 transition-colors active:scale-95"
          >
            <ShoppingBag className="w-6 h-6 text-[#00f3ff]" />
            <span className="text-white/60 text-[10px] font-bold">Tienda</span>
          </button>
          <button
            onClick={() => setScreen('ranking')}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-black/30 border border-white/10 p-3 hover:border-[#ffb700]/30 transition-colors active:scale-95"
          >
            <Trophy className="w-6 h-6 text-[#ffb700]" />
            <span className="text-white/60 text-[10px] font-bold">Ranking</span>
          </button>
          <button
            onClick={() => setScreen('roulette')}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-black/30 border border-white/10 p-3 hover:border-amber-400/30 transition-colors active:scale-95"
          >
            <Star className="w-6 h-6 text-amber-400" />
            <span className="text-white/60 text-[10px] font-bold">Ruleta</span>
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => setScreen('admin')}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-black/30 border border-white/10 p-3 hover:border-amber-400/30 transition-colors active:scale-95"
            >
              <Crown className="w-6 h-6 text-amber-400" />
              <span className="text-white/60 text-[10px] font-bold">Admin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
