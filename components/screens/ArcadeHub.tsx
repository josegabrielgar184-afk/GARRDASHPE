'use client';

import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import {
  Trophy, Coins, ShoppingBag, Star, Gamepad2, Crown, ArrowLeft,
  Zap, ShieldAlert, Circle, Rocket,
} from 'lucide-react';

interface ArcadeGame {
  id: string;
  screen: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  border: string;
  shadow: string;
  badge: string;
  badgeCls: string;
}

// Agregar un juego nuevo = anadir una entrada aqui
const GAMES: ArcadeGame[] = [
  {
    id: 'neon-maze',
    screen: 'neon-maze',
    name: 'Laberinto Neon',
    desc: 'Esquiva zombis y recolecta monedas',
    icon: Zap,
    iconColor: 'text-[#00f3ff]',
    iconBg: 'bg-[#00f3ff]/15',
    iconBorder: 'border-[#00f3ff]/40',
    border: 'border-[#00f3ff]/30',
    shadow: 'shadow-[#00f3ff]/10',
    badge: 'Arcade',
    badgeCls: 'bg-[#00f3ff]/10 border-[#00f3ff]/30 text-[#00f3ff]',
  },
  {
    id: 'garrfly',
    screen: 'garrfly',
    name: 'Culebrita Neón',
    desc: 'Crece comiendo monedas doradas',
    icon: Gamepad2,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15',
    iconBorder: 'border-amber-500/40',
    border: 'border-amber-500/30',
    shadow: 'shadow-amber-500/10',
    badge: 'Habilidad',
    badgeCls: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  },
  {
    id: 'zrunner',
    screen: 'zrunner',
    name: 'Z-Runner',
    desc: 'Carrera en 3 carriles sin chocar',
    icon: ShieldAlert,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/15',
    iconBorder: 'border-red-500/40',
    border: 'border-red-500/30',
    shadow: 'shadow-red-500/10',
    badge: 'Reflejos',
    badgeCls: 'bg-red-500/10 border-red-500/30 text-red-400',
  },
  {
    id: 'garrblade',
    screen: 'garrblade',
    name: 'GarrBlade',
    desc: 'Sube plataformas esquivando barriles',
    icon: Rocket,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/15',
    iconBorder: 'border-purple-500/40',
    border: 'border-purple-500/30',
    shadow: 'shadow-purple-500/10',
    badge: 'Precisión',
    badgeCls: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  },
  {
    id: 'canicas',
    screen: 'canicas',
    name: 'Canicas Explosivas',
    desc: 'Junta grupos de 3 o más iguales',
    icon: Circle,
    iconColor: 'text-[#ff2d95]',
    iconBg: 'bg-[#ff2d95]/15',
    iconBorder: 'border-[#ff2d95]/40',
    border: 'border-[#ff2d95]/30',
    shadow: 'shadow-[#ff2d95]/10',
    badge: 'Puntería',
    badgeCls: 'bg-[#ff2d95]/10 border-[#ff2d95]/30 text-[#ff2d95]',
  },
  {
    id: 'neonbreaker',
    screen: 'neonbreaker',
    name: 'Rompebloques Neón',
    desc: 'Destruye todos los bloques con la pelota',
    icon: Zap,
    iconColor: 'text-[#ff2d95]',
    iconBg: 'bg-[#ff2d95]/15',
    iconBorder: 'border-[#ff2d95]/40',
    border: 'border-[#ff2d95]/30',
    shadow: 'shadow-[#ff2d95]/10',
    badge: 'Arcade',
    badgeCls: 'bg-[#ff2d95]/10 border-[#ff2d95]/30 text-[#ff2d95]',
  },
  {
    id: 'tower',
    screen: 'tower',
    name: 'Torre Perfecta',
    desc: 'Apila bloques con precisión perfecta',
    icon: Rocket,
    iconColor: 'text-[#ffb700]',
    iconBg: 'bg-amber-500/15',
    iconBorder: 'border-amber-500/40',
    border: 'border-amber-500/30',
    shadow: 'shadow-amber-500/10',
    badge: 'Precisión',
    badgeCls: 'bg-amber-500/10 border-amber-500/30 text-[#ffb700]',
  },
];

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

      {/* Cuadricula compacta de minijuegos: 2 por fila en celular, hasta 4 en pantallas grandes */}
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-4 pb-24">
        <p className="text-white/30 text-[10px] font-black tracking-widest uppercase mb-2 px-1">
          Minijuegos ({GAMES.length})
        </p>
        <div className="grid grid-cols-2 min-[420px]:grid-cols-3 lg:grid-cols-4 gap-3">
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => setScreen(game.screen as never)}
                className={`group rounded-2xl bg-gradient-to-br from-white/[0.04] via-[#0a0e17] to-black/40 border ${game.border} p-3 text-left active:scale-[0.97] transition-transform shadow-lg ${game.shadow}`}
              >
                <div className={`w-11 h-11 rounded-xl ${game.iconBg} border ${game.iconBorder} flex items-center justify-center mb-2.5`}>
                  <Icon className={`w-6 h-6 ${game.iconColor}`} />
                </div>
                <h2 className="text-white font-black text-[13px] leading-tight mb-1">
                  {game.name.toUpperCase()}
                </h2>
                <p className="text-white/40 text-[10px] leading-snug mb-2.5">
                  {game.desc}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`px-1.5 py-0.5 rounded-full border text-[9px] font-bold ${game.badgeCls}`}>
                    {game.badge}
                  </span>
                  <span className={`text-[10px] font-black ${game.iconColor} opacity-70 group-active:opacity-100`}>
                    JUGAR ▸
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer: quick access buttons */}
        <div className="grid grid-cols-4 gap-3 pt-5">
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
          {userRole === 'admin' ? (
            <button
              onClick={() => setScreen('admin')}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-black/30 border border-white/10 p-3 hover:border-amber-400/30 transition-colors active:scale-95"
            >
              <Crown className="w-6 h-6 text-amber-400" />
              <span className="text-white/60 text-[10px] font-bold">Admin</span>
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
