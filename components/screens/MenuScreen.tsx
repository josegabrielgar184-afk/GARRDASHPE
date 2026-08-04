'use client';

import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import {
  Coins, Gamepad2, Store, Disc, Users, Crown, LogOut, Trophy, Settings, X,
  Droplet, Volume2, VolumeX, ShieldCheck, Smartphone, RotateCcw, Download, ShieldAlert,
  Sparkles, Gem, Lock, Gift, ChevronUp, ChevronDown, Eye,
} from 'lucide-react';
import {
  INFLUENCER_MIN_RUNS, INFLUENCER_MIN_SCORE, INFLUENCER_MIN_BALANCE,
} from '@/lib/config';

export function MenuScreen() {
  const {
    coins, vip, vipAvailable, vipExpiry, setScreen, getCharacter, logOut,
    topPlayerName, topPlayerScore, topPlayerAvatar, isOnline, pendingCoins, muted, toggleMute,
    bloodEnabled, toggleBlood, orientationMode, setOrientationMode, offerwallConfig, userRole,
    influencerInfo, refreshInfluencerInfo,
    showWelcomeBonus, dismissWelcomeBonus, campaignProgress,
  } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const char = getCharacter();

  useEffect(() => {
    refreshInfluencerInfo();
  }, [refreshInfluencerInfo]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollDown(el.scrollTop < el.scrollHeight - el.clientHeight - 10);
    setCanScrollUp(el.scrollTop > 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    const interval = setInterval(checkScroll, 500);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      clearInterval(interval);
    };
  }, []);

  const scrollDown = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: 200, behavior: 'smooth' });
  };
  const scrollUp = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: -200, behavior: 'smooth' });
  };

  const handleOfferwall = () => {
    setScreen('offerwall');
  };

  const handleInfluencer = () => {
    if (!influencerInfo) {
      showToast('Cargando informacion de creador...');
      return;
    }
    const missing: string[] = [];
    if (influencerInfo.totalRuns < INFLUENCER_MIN_RUNS) missing.push(`Partidas: ${influencerInfo.totalRuns}/${INFLUENCER_MIN_RUNS}`);
    if (influencerInfo.bestScore < INFLUENCER_MIN_SCORE) missing.push(`Mejor score: ${influencerInfo.bestScore.toLocaleString()}/${INFLUENCER_MIN_SCORE.toLocaleString()}`);
    if (influencerInfo.coins < INFLUENCER_MIN_BALANCE) missing.push(`Monedas: ${influencerInfo.coins.toLocaleString()}/${INFLUENCER_MIN_BALANCE.toLocaleString()}`);
    if (missing.length > 0) {
      showToast('Requisitos faltantes: ' + missing.join(' · '));
      return;
    }
    setScreen('influencer');
  };

  const influencerEligible = influencerInfo
    ? influencerInfo.totalRuns >= INFLUENCER_MIN_RUNS
      && influencerInfo.bestScore >= INFLUENCER_MIN_SCORE
      && influencerInfo.coins >= INFLUENCER_MIN_BALANCE
    : false;

  const vipDaysLeft = vipExpiry ? Math.ceil((new Date(vipExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

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

      <div ref={scrollRef} className="flex-1 flex flex-col items-center px-4 pb-28 relative z-10 overflow-y-auto no-scrollbar pt-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-4">
            <h1 className="neon-title text-5xl font-black tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              GARRDASH
            </h1>
          </div>

          {/* Throne of the Global King */}
          <div className="mb-4 rounded-2xl bg-gradient-to-br from-amber-900/40 via-amber-800/20 to-card border border-amber-500/40 p-4 shadow-lg shadow-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  {topPlayerAvatar ? (
                    <img src={topPlayerAvatar} alt="King" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <Crown className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-amber-300 text-[10px] font-bold uppercase tracking-wider">Rey Global</span>
                </div>
                <p className="text-white font-bold text-sm truncate flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />{topPlayerName}</p>
                <p className="text-amber-400 font-mono text-xs">{topPlayerScore.toLocaleString()} pts</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-white/40 uppercase">Racha</div>
                <div className="text-amber-400 font-bold text-lg">#1</div>
              </div>
            </div>
          </div>

          {/* Balance card */}
          <div className="mb-4">
            <div className="rounded-2xl bg-card border border-amber-500/30 p-3 flex items-center gap-2 shadow-lg shadow-amber-500/10">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center"><Coins className="w-4 h-4 text-amber-400" /></div>
              <div><p className="text-white/40 text-[10px] uppercase">Monedas</p><p className="text-amber-400 font-bold">{coins.toLocaleString()}</p></div>
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
            <button onClick={() => setScreen('campaign')} className="neon-btn-cyan aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95">
              <Gamepad2 className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-sm">CAMPAÑA</span>
            </button>
            <button onClick={() => setScreen('shop')} className="neon-btn-green aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95">
              <Store className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-sm">TIENDA</span>
            </button>
            <button onClick={() => setScreen('canjes')} className="neon-btn-cyan aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95">
              <Gift className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-sm">CANJES</span>
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

          {/* Campaign progress indicator */}
          <div className="mt-3 rounded-xl bg-card border border-cyan-500/20 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <span className="text-cyan-400 font-black text-sm">{campaignProgress.currentLevel}</span>
              </div>
              <div>
                <p className="text-white/60 text-[10px] uppercase">Nivel de Campaña</p>
                <div className="flex items-center gap-1">
                  {campaignProgress.keys > 0 && <span className="text-amber-400 text-[10px] font-bold flex items-center gap-0.5">{campaignProgress.keys} llaves</span>}
                </div>
              </div>
            </div>
            <button onClick={() => setScreen('campaign')} className="text-cyan-400 text-xs font-bold hover:text-cyan-300">Continuar &gt;</button>
          </div>

          {/* Monedas Gratis + Admin row */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={handleOfferwall}
              className="rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/40 text-green-400 hover:from-green-500/30 hover:to-cyan-500/30"
            >
              <Gift className="w-4 h-4" />
              Monedas Gratis
            </button>
            {(userRole === 'admin' || userRole === 'operador') && (
              <button
                onClick={() => setScreen(userRole === 'admin' ? 'admin' : 'operator')}
                className="rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 bg-gradient-to-r from-amber-600/20 to-amber-500/20 border border-amber-500/40 text-amber-400"
              >
                <ShieldAlert className="w-4 h-4" />
                {userRole === 'admin' ? 'ADMIN' : 'OPERADOR'}
              </button>
            )}
          </div>

          {/* Influencer / Creadores button */}
          <div className="mt-3">
            <button
              onClick={handleInfluencer}
              className={`w-full rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 ${
                influencerEligible
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-500/20 border border-purple-500/40 text-purple-400'
                  : 'bg-card border border-border text-white/30'
              }`}
            >
              {influencerEligible ? <Gem className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {influencerEligible
                ? `CREADORES (${influencerInfo?.rank.toUpperCase() ?? 'NUEVO'})`
                : 'CREADORES (BLOQUEADO)'}
            </button>
          </div>

          {/* VIP + logout */}
          <div className="mt-6 flex items-center gap-3">
            {!vip ? (
              vipAvailable ? (
                <button onClick={() => setScreen('shop')} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20">
                  <Crown className="w-4 h-4" />Comprar VIP
                </button>
              ) : (
                <div className="flex-1 py-3 rounded-xl bg-card border border-border text-white/30 font-bold text-sm flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />VIP Proximamente
                </div>
              )
            ) : (
              <div className="flex-1 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />VIP Activo{vipDaysLeft > 0 ? ` (${vipDaysLeft}d)` : ''}
              </div>
            )}
            <button onClick={() => { logOut(); }} className="px-4 py-3 rounded-xl bg-card border border-border text-white/40 hover:text-white/60 transition-colors flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating scroll arrows */}
      {canScrollDown && (
        <button
          onClick={scrollDown}
          className="fixed bottom-24 right-4 z-40 w-10 h-10 rounded-full bg-cyan-500/20 backdrop-blur border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition-colors shadow-lg animate-fade-in"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}
      {canScrollUp && (
        <button
          onClick={scrollUp}
          className="fixed top-20 right-4 z-40 w-10 h-10 rounded-full bg-cyan-500/20 backdrop-blur border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition-colors shadow-lg animate-fade-in"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Toast */}
      {showWelcomeBonus && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs mx-4 rounded-2xl bg-gradient-to-br from-amber-900/40 to-card border-2 border-amber-400/50 p-6 text-center animate-scale-in shadow-2xl shadow-amber-500/30">
            <Gift className="w-16 h-16 text-amber-400 mx-auto mb-3 animate-bounce" />
            <h2 className="text-amber-300 font-black text-xl mb-2">¡Bono de Bienvenida!</h2>
            <p className="text-white/70 text-sm mb-1">¡Gracias por unirte a GarrDash!</p>
            <p className="text-amber-400 font-bold text-lg mb-4">+500 Monedas</p>
            <button onClick={dismissWelcomeBonus} className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400">¡Gracias!</button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-40 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl bg-card border border-purple-500/40 shadow-2xl shadow-purple-500/20 animate-scale-in max-w-xs">
          <p className="text-white text-xs font-bold text-center">{toast}</p>
        </div>
      )}

      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-card border border-cyan-500/30 p-6 animate-scale-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl flex items-center gap-2"><Settings className="w-5 h-5 text-cyan-400" />Ajustes</h2>
              <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              <button onClick={toggleMute} className="w-full flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border">
                <div className="flex items-center gap-3">
                  {muted ? <VolumeX className="w-5 h-5 text-white/40" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
                  <div className="text-left"><p className="text-white font-bold text-sm">Sonido</p><p className="text-white/40 text-xs">{muted ? 'Silenciado' : 'Activo'}</p></div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${muted ? 'bg-white/10' : 'bg-cyan-500/40'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${muted ? 'translate-x-0.5' : 'translate-x-6'} mt-0.5`} />
                </div>
              </button>

              <button onClick={toggleBlood} className="w-full flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border">
                <div className="flex items-center gap-3">
                  <Droplet className={`w-5 h-5 ${bloodEnabled ? 'text-red-400' : 'text-white/40'}`} />
                  <div className="text-left"><p className="text-white font-bold text-sm">Efectos de Sangre Neon</p><p className="text-white/40 text-xs">{bloodEnabled ? 'Visibles' : 'Ocultos (apto para todas las edades)'}</p></div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${bloodEnabled ? 'bg-red-500/40' : 'bg-white/10'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${bloodEnabled ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                </div>
              </button>

              <a href="/privacy.html" target="_blank" rel="noopener" className="w-full flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  <div className="text-left"><p className="text-white font-bold text-sm">Politica de Privacidad</p><p className="text-white/40 text-xs">Ver documento legal</p></div>
                </div>
              </a>

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

            <p className="mt-6 text-center text-white/30 text-xs">GARRDASH v2.0.0 &copy; 2026</p>
          </div>
        </div>
      )}
    </div>
  );
}
