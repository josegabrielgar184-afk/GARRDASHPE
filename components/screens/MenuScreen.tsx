'use client';

import { useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import { Coins, Star, Gamepad2, Store, Disc, Users, Crown, LogOut, Trophy, Settings, X, Droplet, Volume2, VolumeX, ShieldCheck, Smartphone, RotateCcw } from 'lucide-react';

export function MenuScreen() {
  const { coins, points, vip, setScreen, getCharacter, logOut, topPlayerName, topPlayerScore, isOnline, pendingCoins, muted, toggleMute, bloodEnabled, toggleBlood, orientationMode, setOrientationMode } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const char = getCharacter();

  // Floating particle positions (generated once on client)
  const [particles] = useState(() =>
    Array.from({ length: 18 }, () => ({
      left: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 8,
      color: ['#22d3ee', '#d946ef', '#fbbf24', '#4ade80'][Math.floor(Math.random() * 4)],
    }))
  );

  return (
    <div className="h-full flex flex-col space-bg relative overflow-hidden">
      <OfflineBanner />
      {/* Floating light particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              bottom: '-10px',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
              animation: `float-particle ${p.duration}s ease-in ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <MuteButton />
      <SuggestionButton onClick={() => setShowSuggestion(true)} />
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-4 right-14 z-40 w-10 h-10 rounded-full bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24 relative z-10">
        <div className="w-full max-w-sm">
          {/* Imperial Neon Title */}
          <div className="text-center mb-4">
            <h1 className="neon-title text-5xl font-black tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              GARRDASHPE
            </h1>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-amber-500/30 backdrop-blur">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 text-xs font-bold">TOP 1:</span>
              <span className="text-white text-xs font-bold">{topPlayerName}</span>
              <span className="text-white/30 text-xs">-</span>
              <span className="text-amber-400 text-xs font-mono">{topPlayerScore.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Balance cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl bg-card border border-amber-500/30 p-3 flex items-center gap-2 shadow-lg shadow-amber-500/10">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center"><Coins className="w-4 h-4 text-amber-400" /></div>
              <div><p className="text-white/40 text-[10px] uppercase">Monedas</p><p className="text-amber-400 font-bold">{coins.toLocaleString()}</p></div>
            </div>
            <div className="rounded-2xl bg-card border border-cyan-500/30 p-3 flex items-center gap-2 shadow-lg shadow-cyan-500/10">
              <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center"><Star className="w-4 h-4 text-cyan-400" /></div>
              <div><p className="text-white/40 text-[10px] uppercase">Puntos</p><p className="text-cyan-400 font-bold">{points.toLocaleString()}</p></div>
            </div>
          </div>

          {/* Character badge */}
          <button onClick={() => setScreen('characters')} className="w-full rounded-2xl bg-card border p-3 flex items-center gap-3 mb-6 shadow-lg transition-colors hover:bg-secondary/40" style={{ borderColor: `${char.color}55` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${char.color}30`, border: `2px solid ${char.color}` }}>
              <span className="font-bold" style={{ color: char.color }}>{char.name[0]}</span>
            </div>
            <div className="flex-1 text-left"><p className="text-white font-bold text-sm">{char.name}</p><p className="text-white/40 text-xs">{char.skill}</p></div>
            <Users className="w-5 h-5 text-cyan-400/60" />
          </button>

          {/* 4 neon centralized buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setScreen('mode-select')} className="neon-btn-cyan aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95">
              <Gamepad2 className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-sm">JUGAR</span>
            </button>
            <button onClick={() => setScreen('shop')} className="neon-btn-green aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95">
              <Store className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-sm">TIENDA</span>
            </button>
            <button onClick={() => setScreen('roulette')} className="neon-btn-amber aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95">
              <Disc className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-sm">RULETA</span>
            </button>
            <button onClick={() => setScreen('ranking')} className="neon-btn-magenta aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95">
              <Trophy className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-sm">RANKINGS</span>
            </button>
          </div>

          {/* VIP + logout */}
          <div className="mt-6 flex items-center gap-3">
            {!vip ? (
              <button onClick={() => setScreen('shop')} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20">
                <Crown className="w-4 h-4" />Comprar VIP
              </button>
            ) : (
              <div className="flex-1 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />VIP Activo
              </div>
            )}
            <button onClick={() => { logOut(); }} className="px-4 py-3 rounded-xl bg-card border border-border text-white/40 hover:text-white/60 transition-colors flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-card border border-cyan-500/30 p-6 animate-scale-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl flex items-center gap-2"><Settings className="w-5 h-5 text-cyan-400" />Ajustes</h2>
              <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              {/* Sound toggle */}
              <button onClick={toggleMute} className="w-full flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border">
                <div className="flex items-center gap-3">
                  {muted ? <VolumeX className="w-5 h-5 text-white/40" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
                  <div className="text-left"><p className="text-white font-bold text-sm">Sonido</p><p className="text-white/40 text-xs">{muted ? 'Silenciado' : 'Activo'}</p></div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${muted ? 'bg-white/10' : 'bg-cyan-500/40'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${muted ? 'translate-x-0.5' : 'translate-x-6'} mt-0.5`} />
                </div>
              </button>

              {/* Blood toggle */}
              <button onClick={toggleBlood} className="w-full flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border">
                <div className="flex items-center gap-3">
                  <Droplet className={`w-5 h-5 ${bloodEnabled ? 'text-red-400' : 'text-white/40'}`} />
                  <div className="text-left"><p className="text-white font-bold text-sm">Efectos de Sangre Neon</p><p className="text-white/40 text-xs">{bloodEnabled ? 'Visibles' : 'Ocultos (apto para todas las edades)'}</p></div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${bloodEnabled ? 'bg-red-500/40' : 'bg-white/10'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${bloodEnabled ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                </div>
              </button>

              {/* Privacy policy link */}
              <a href="/privacy.html" target="_blank" rel="noopener" className="w-full flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  <div className="text-left"><p className="text-white font-bold text-sm">Politica de Privacidad</p><p className="text-white/40 text-xs">Ver documento legal</p></div>
                </div>
              </a>

              {/* Orientation mode */}
              <div className="w-full p-3 rounded-xl bg-background/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  <div className="text-left"><p className="text-white font-bold text-sm">Orientacion</p><p className="text-white/40 text-xs">Bloqueo manual de rotacion</p></div>
                </div>
                <div className="flex gap-2">
                  {(['auto', 'portrait', 'landscape'] as const).map((m) => (
                    <button key={m} onClick={() => setOrientationMode(m)} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-colors ${orientationMode === m ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-card border border-border text-white/40'}`}>
                      {m === 'auto' ? 'Auto' : m === 'portrait' ? 'Vertical' : 'Horizontal'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-white/30 text-xs">GARRDASHPE v1.0.0 &copy; 2026</p>
          </div>
        </div>
      )}
    </div>
  );
}
