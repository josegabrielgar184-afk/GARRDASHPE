'use client';

import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import {
  Coins, Gamepad2, Store, Disc, Crown, LogOut, Trophy, Settings, X,
  Droplet, Volume2, VolumeX, ShieldCheck, Palette, Download, ShieldAlert,
  Sparkles, Gem, Lock, Gift, ChevronUp, ChevronDown, Eye, Bell, UserPlus, Copy, Check,
} from 'lucide-react';
import {
  INFLUENCER_MIN_RUNS, INFLUENCER_MIN_SCORE, INFLUENCER_MIN_BALANCE,
} from '@/lib/config';
import { getPerformanceTier, setPerformanceTier, type PerformanceTier } from '@/lib/performance';
import { UI_THEMES, type UITheme } from '@/hooks/use-game';
import { auth } from '@/lib/firebase';

export function MenuScreen() {
  const {
    coins, vip, vipAvailable, vipExpiry, setScreen, logOut,
    topPlayerName, topPlayerScore, topPlayerAvatar, isOnline, pendingCoins, muted, toggleMute,
    bloodEnabled, toggleBlood, uiTheme, setUITheme, offerwallConfig, userRole,
    influencerInfo, refreshInfluencerInfo,
    showWelcomeBonus, dismissWelcomeBonus, showReturnReward, dismissReturnReward,
    exchangeNotification, dismissExchangeNotification, campaignProgress,
  } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [perfTier, setPerfTierState] = useState<PerformanceTier>('high');
  const [customColor, setCustomColor] = useState('#8a9b50');
  const [showReferral, setShowReferral] = useState(false);

  const applyCustomColor = (hex: string) => {
    const root = document.documentElement;
    const hexToHsl = (h: string): string => {
      const r = parseInt(h.slice(1, 3), 16) / 255;
      const g = parseInt(h.slice(3, 5), 16) / 255;
      const b = parseInt(h.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let hue = 0, sat = 0;
      const lig = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        sat = lig > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: hue = ((g - b) / d + (g < b ? 6 : 0)); break;
          case g: hue = ((b - r) / d + 2); break;
          case b: hue = ((r - g) / d + 4); break;
        }
        hue /= 6;
      }
      return `${Math.round(hue * 360)} ${Math.round(sat * 100)}% ${Math.round(lig * 100)}%`;
    };
    const primaryHsl = hexToHsl(hex);
    const bgHsl = `${primaryHsl.split(' ')[0]} 20% 6%`;
    const accentHsl = `${primaryHsl.split(' ')[0]} ${Math.min(100, parseInt(primaryHsl.split(' ')[1]) + 20)}% ${Math.min(90, parseInt(primaryHsl.split(' ')[2]) + 20)}%`;
    root.style.setProperty('--background', bgHsl);
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--ring', primaryHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--foreground', `${primaryHsl.split(' ')[0]} 10% 88%`);
    root.style.setProperty('--card', `${bgHsl.split(' ')[0]} 15% 12%`);
    root.style.setProperty('--card-foreground', `${primaryHsl.split(' ')[0]} 10% 88%`);
    root.style.setProperty('--border', `${primaryHsl.split(' ')[0]} 10% 22%`);
    root.style.setProperty('--secondary', `${bgHsl.split(' ')[0]} 12% 18%`);
    root.style.setProperty('--muted', `${bgHsl.split(' ')[0]} 12% 18%`);
    root.style.setProperty('--popover', `${bgHsl.split(' ')[0]} 15% 10%`);
    root.style.setProperty('--popover-foreground', `${primaryHsl.split(' ')[0]} 10% 88%`);
    root.style.setProperty('--input', `${primaryHsl.split(' ')[0]} 10% 20%`);
    root.style.setProperty('--destructive', primaryHsl);
    root.style.setProperty('--destructive-foreground', `${primaryHsl.split(' ')[0]} 10% 88%`);
    root.style.setProperty('--muted-foreground', `${primaryHsl.split(' ')[0]} 8% 55%`);
    root.style.setProperty('--accent-foreground', `${primaryHsl.split(' ')[0]} 10% 88%`);
    root.style.setProperty('--secondary-foreground', `${primaryHsl.split(' ')[0]} 10% 88%`);
    root.style.setProperty('--tac-primary', hex);
    root.style.setProperty('--tac-accent', hex);
    root.style.setProperty('--tac-bg', `hsl(${bgHsl})`);
  };
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [referralLoading, setReferralLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  useEffect(() => {
    setPerfTierState(getPerformanceTier());
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

  const handleReferral = async () => {
    if (referralCode) { setShowReferral(true); return; }
    setReferralLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
      const user = auth.currentUser;
      if (!user) { showToast('Debes iniciar sesion'); return; }
      const code = `GARR-${user.uid.slice(0, 8).toUpperCase()}`;
      const res = await fetch(`${supabaseUrl}/rest/v1/referrals?select=referral_code,referrer_uid,status`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const rows = await res.json() as Array<{ referral_code: string; referrer_uid: string; status: string }>;
        const existing = rows.find((r) => r.referrer_uid === user.uid && r.referral_code === code);
        if (existing) {
          setReferralCode(code);
          const completed = rows.filter((r) => r.referrer_uid === user.uid && (r.status === 'completed' || r.status === 'rewarded')).length;
          setReferralCount(completed);
          setShowReferral(true);
          return;
        }
      }
      await fetch(`${supabaseUrl}/rest/v1/referrals`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referrer_uid: user.uid, referral_code: code, status: 'pending' }),
      });
      setReferralCode(code);
      setShowReferral(true);
    } catch {
      showToast('Error al generar enlace');
    } finally {
      setReferralLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!referralCode) return;
    const link = `https://garrdash.web.app/registro?ref=${referralCode}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'GarrDash', text: '¡Únete a GarrDash y gana monedas!', url: link });
        return;
      }
      navigator.clipboard.writeText(link);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    } catch {
      try {
        navigator.clipboard.writeText(link);
        setReferralCopied(true);
        setTimeout(() => setReferralCopied(false), 2000);
      } catch {
        showToast('No se pudo copiar');
      }
    }
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
    Array.from({ length: 12 }, () => ({
      left: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 10 + Math.random() * 12,
      delay: Math.random() * 10,
      color: ['#8a9b50', '#5a6b30', '#f59e0b', '#6b7280'][Math.floor(Math.random() * 4)],
    }))
  );

  return (
    <div className="h-full flex flex-col tac-bg relative overflow-hidden">
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
        className="fixed top-4 right-14 z-40 w-10 h-10 rounded-lg tac-btn flex items-center justify-center text-[#8a9b50] hover:text-[#d4d8b8] transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>

      <div ref={scrollRef} className="flex-1 flex flex-col items-center px-4 pb-32 relative z-10 overflow-y-auto no-scrollbar pt-14">
        <div className="w-full max-w-sm">
          <div className="text-center mb-2">
            <h1 className="tac-title text-4xl font-black" style={{ fontFamily: 'Inter, sans-serif' }}>
              GARRDASH
            </h1>
            <div className="mt-0.5 flex items-center justify-center gap-1.5">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#5a6b30]" />
              <span className="text-[#8a9b50]/60 text-[8px] font-bold uppercase tracking-[0.3em]">Zona de Combate</span>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#5a6b30]" />
            </div>
          </div>

          {/* Top 1 Monthly — compact card */}
          <div className="mb-2 tac-panel tac-stencil p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#5a6b30] to-[#3a4b20] flex items-center justify-center border border-[#8a9b50]/40" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}>
                  {topPlayerAvatar ? (
                    <img src={topPlayerAvatar} alt="King" className="w-full h-full object-cover" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }} />
                  ) : (
                    <Crown className="w-5 h-5 text-[#d4d8b8]" />
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f59e0b] flex items-center justify-center shadow-lg">
                  <Sparkles className="w-2.5 h-2.5 text-[#1a1f10]" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <Crown className="w-3 h-3 text-[#f59e0b] shrink-0" />
                  <span className="text-[#f59e0b]/80 text-[9px] font-bold uppercase tracking-wider">Top 1 Mensual</span>
                </div>
                <p className="text-[#d4d8b8] font-bold text-xs truncate flex items-center gap-1"><Crown className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b] shrink-0" />{topPlayerName}</p>
                <p className="text-[#8a9b50] font-mono text-[10px]">{topPlayerScore.toLocaleString()} pts</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[9px] text-[#6b7280] uppercase">Rango</div>
                <div className="text-[#f59e0b] font-bold text-base">#1</div>
              </div>
            </div>
          </div>

          {/* Balance card */}
          <div className="mb-2">
            <div className="tac-panel tac-stencil p-2.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[#f59e0b]/15 flex items-center justify-center border border-[#f59e0b]/30"><Coins className="w-4 h-4 text-[#f59e0b]" /></div>
              <div><p className="text-[#6b7280] text-[9px] uppercase tracking-wider">Munición</p><p className="text-[#f59e0b] font-bold tac-amber-glow text-sm">{coins.toLocaleString()}</p></div>
            </div>
          </div>

          {/* 5 tactical buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setScreen('campaign')} className="tac-btn tac-stencil aspect-square rounded-lg flex flex-col items-center justify-center gap-2">
              <Gamepad2 className="w-8 h-8 text-[#d4d8b8]" />
              <span className="text-[#d4d8b8] font-bold text-sm tracking-wider">CAMPAÑA</span>
            </button>
            <button onClick={() => setScreen('shop')} className="tac-btn tac-stencil aspect-square rounded-lg flex flex-col items-center justify-center gap-2">
              <Store className="w-8 h-8 text-[#d4d8b8]" />
              <span className="text-[#d4d8b8] font-bold text-sm tracking-wider">ARSENAL</span>
            </button>
            <button onClick={() => setScreen('canjes')} className="tac-btn-accent tac-stencil aspect-square rounded-lg flex flex-col items-center justify-center gap-2">
              <Gift className="w-8 h-8 text-[#fbbf24]" />
              <span className="text-[#fbbf24] font-bold text-sm tracking-wider">CANJES</span>
            </button>
            <button onClick={() => setScreen('roulette')} className="tac-btn-accent tac-stencil aspect-square rounded-lg flex flex-col items-center justify-center gap-2">
              <Disc className="w-8 h-8 text-[#fbbf24]" />
              <span className="text-[#fbbf24] font-bold text-sm tracking-wider">RULETA</span>
            </button>
          </div>

          {/* Rankings + Suministros (matching large cards, side by side) */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button onClick={() => setScreen('ranking')} className="tac-btn-danger tac-stencil aspect-square rounded-lg flex flex-col items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-[#fca5a5]" />
              <span className="text-[#fca5a5] font-bold text-sm tracking-wider">RANKINGS</span>
            </button>
            <button onClick={handleOfferwall} className="tac-btn tac-stencil aspect-square rounded-lg flex flex-col items-center justify-center gap-2">
              <Gift className="w-8 h-8 text-[#d4d8b8]" />
              <span className="text-[#d4d8b8] font-bold text-sm tracking-wider">SUMINISTROS</span>
            </button>
          </div>

          {/* Admin row (only for admins/operators) */}
          {(userRole === 'admin' || userRole === 'operador') && (
            <div className="mt-3">
              <button
                onClick={() => setScreen(userRole === 'admin' ? 'admin' : 'operator')}
                className="w-full tac-btn-accent tac-stencil rounded-lg py-2.5 flex items-center justify-center gap-2 font-bold text-xs text-[#f59e0b]"
              >
                <ShieldAlert className="w-4 h-4" />
                {userRole === 'admin' ? 'COMANDO' : 'OPERADOR'}
              </button>
            </div>
          )}

          {/* Invite friend button */}
          <div className="mt-3">
            <button
              onClick={handleReferral}
              disabled={referralLoading}
              className="w-full tac-stencil rounded-lg py-2.5 flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 tac-btn text-[#8a9b50] hover:text-[#d4d8b8]"
            >
              <UserPlus className="w-4 h-4" />
              {referralLoading ? 'GENERANDO...' : 'INVITAR AMIGO (+200)'}
            </button>
          </div>

          {/* Logout */}
          <div className="mt-6 flex items-center justify-center">
            <button onClick={() => { logOut(); }} className="px-4 py-3 tac-btn rounded-lg text-[#6b7280] hover:text-[#d4d8b8] transition-colors flex items-center justify-center gap-2 font-bold text-sm">
              <LogOut className="w-4 h-4" />
              CERRAR SESIÓN
            </button>
          </div>
        </div>
      </div>

      {/* Floating scroll arrows */}
      {canScrollDown && (
        <button
          onClick={scrollDown}
          className="fixed bottom-24 right-4 z-40 w-10 h-10 rounded-lg tac-btn flex items-center justify-center text-[#8a9b50] hover:text-[#d4d8b8] transition-colors animate-fade-in"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}
      {canScrollUp && (
        <button
          onClick={scrollUp}
          className="fixed top-20 right-4 z-40 w-10 h-10 rounded-lg tac-btn flex items-center justify-center text-[#8a9b50] hover:text-[#d4d8b8] transition-colors animate-fade-in"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Toast */}
      {showWelcomeBonus && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs mx-4 tac-panel tac-stencil rounded-lg p-6 text-center animate-scale-in">
            <Gift className="w-16 h-16 text-[#f59e0b] mx-auto mb-3 animate-bounce" />
            <h2 className="text-[#f59e0b] font-black text-xl mb-2 tac-amber-glow">¡Bono de Bienvenida!</h2>
            <p className="text-[#d4d8b8]/70 text-sm mb-1">¡Gracias por unirte a GarrDash!</p>
            <p className="text-[#f59e0b] font-bold text-lg mb-4">+500 Munición +1 Llave</p>
            <button onClick={dismissWelcomeBonus} className="w-full py-3 tac-btn-accent tac-stencil rounded-lg text-[#fbbf24] font-bold">¡Recibido!</button>
          </div>
        </div>
      )}

      {showReturnReward && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs mx-4 tac-panel tac-stencil rounded-lg p-6 text-center animate-scale-in">
            <Sparkles className="w-16 h-16 text-[#8a9b50] mx-auto mb-3 animate-bounce" />
            <h2 className="text-[#8a9b50] font-black text-xl mb-2 tac-text-glow">¡Bono de Retorno!</h2>
            <p className="text-[#d4d8b8]/70 text-sm mb-1">¡Te extrañamos! Gracias por volver a GarrDash</p>
            <p className="text-[#8a9b50] font-bold text-lg mb-4">+200 Munición</p>
            <button onClick={dismissReturnReward} className="w-full py-3 tac-btn tac-stencil rounded-lg text-[#d4d8b8] font-bold">¡Entendido!</button>
          </div>
        </div>
      )}

      {exchangeNotification && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs mx-4 tac-panel tac-stencil rounded-lg p-6 text-center animate-scale-in">
            <Bell className="w-16 h-16 text-[#8a9b50] mx-auto mb-3 animate-bounce" />
            <h2 className="text-[#8a9b50] font-black text-xl mb-2 tac-text-glow">¡Canje Completado!</h2>
            <p className="text-[#d4d8b8]/80 text-sm mb-4">{exchangeNotification}</p>
            <button onClick={dismissExchangeNotification} className="w-full py-3 tac-btn tac-stencil rounded-lg text-[#d4d8b8] font-bold">¡Entendido!</button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-40 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 tac-panel tac-stencil rounded-lg animate-scale-in max-w-xs">
          <p className="text-[#d4d8b8] text-xs font-bold text-center">{toast}</p>
        </div>
      )}

      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />

      {showReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowReferral(false)}>
          <div className="w-full max-w-xs mx-4 tac-panel tac-stencil rounded-lg p-6 text-center animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#d4d8b8] font-bold text-lg flex items-center gap-2"><UserPlus className="w-5 h-5 text-[#8a9b50]" />Invitar Amigo</h2>
              <button onClick={() => setShowReferral(false)} className="w-8 h-8 rounded-lg tac-btn flex items-center justify-center text-[#6b7280] hover:text-[#d4d8b8]"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-[#d4d8b8]/70 text-xs mb-4">Comparte este enlace con tu amigo. Cuando instale el juego y cree su cuenta, recibiras <span className="text-[#f59e0b] font-bold">+200 monedas</span>.</p>
            <div className="tac-btn rounded-lg p-3 mb-4">
              <p className="text-[#8a9b50] text-[10px] font-bold uppercase mb-1">Tu codigo</p>
              <p className="text-[#d4d8b8] font-mono font-bold text-sm break-all">{referralCode}</p>
            </div>
            <button onClick={copyReferralLink} className="w-full py-3 tac-btn-accent tac-stencil rounded-lg text-[#fbbf24] font-bold mb-2 flex items-center justify-center gap-2">
              {referralCopied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Enlace</>}
            </button>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="text-[10px] text-[#6b7280]">Amigos invitados: <span className="text-[#8a9b50] font-bold">{referralCount}</span></div>
            </div>
            <p className="text-[#6b7280] text-[10px] mt-3">Anti-trampas: No puedes invitarte a ti mismo. Un dispositivo solo puede ser invitado una vez.</p>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-sm mx-4 tac-panel rounded-lg p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#d4d8b8] font-bold text-xl flex items-center gap-2"><Settings className="w-5 h-5 text-[#8a9b50]" />Ajustes</h2>
              <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-lg tac-btn flex items-center justify-center text-[#6b7280] hover:text-[#d4d8b8]"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              <button onClick={toggleMute} className="w-full flex items-center justify-between p-3 tac-btn rounded-lg">
                <div className="flex items-center gap-3">
                  {muted ? <VolumeX className="w-5 h-5 text-[#6b7280]" /> : <Volume2 className="w-5 h-5 text-[#8a9b50]" />}
                  <div className="text-left"><p className="text-[#d4d8b8] font-bold text-sm">Sonido</p><p className="text-[#6b7280] text-xs">{muted ? 'Silenciado' : 'Activo'}</p></div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${muted ? 'bg-white/10' : 'bg-[#8a9b50]/40'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${muted ? 'translate-x-0.5' : 'translate-x-6'} mt-0.5`} />
                </div>
              </button>

              <button onClick={toggleBlood} className="w-full flex items-center justify-between p-3 tac-btn rounded-lg">
                <div className="flex items-center gap-3">
                  <Droplet className={`w-5 h-5 ${bloodEnabled ? 'text-[#ef4444]' : 'text-[#6b7280]'}`} />
                  <div className="text-left"><p className="text-[#d4d8b8] font-bold text-sm">Efectos de Sangre</p><p className="text-[#6b7280] text-xs">{bloodEnabled ? 'Visibles' : 'Ocultos (apto para todas las edades)'}</p></div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${bloodEnabled ? 'bg-[#ef4444]/40' : 'bg-white/10'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${bloodEnabled ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                </div>
              </button>

              <a href="/privacy.html" target="_blank" rel="noopener" className="w-full flex items-center justify-between p-3 tac-btn rounded-lg hover:bg-[#8a9b50]/10 transition-colors">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#8a9b50]" />
                  <div className="text-left"><p className="text-[#d4d8b8] font-bold text-sm">Politica de Privacidad</p><p className="text-[#6b7280] text-xs">Ver documento legal</p></div>
                </div>
              </a>

              {/* UI Theme selector */}
              <div className="w-full p-3 tac-btn rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Palette className="w-5 h-5 text-[#8a9b50]" />
                  <div className="text-left"><p className="text-[#d4d8b8] font-bold text-sm">Color de Interfaz</p><p className="text-[#6b7280] text-xs">Personaliza tu tema</p></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {UI_THEMES.map((t) => (
                    <button key={t.id} onClick={() => setUITheme(t.id as UITheme)} className={`flex items-center gap-2 py-2 px-3 rounded-lg font-bold text-xs transition-colors ${uiTheme === t.id ? 'border' : 'tac-btn text-[#6b7280]'}`} style={uiTheme === t.id ? { background: `${t.primary}20`, color: t.primary, borderColor: `${t.primary}60` } : {}}>
                      <div className="w-3 h-3 rounded-full" style={{ background: t.primary, boxShadow: `0 0 6px ${t.primary}` }} />
                      {t.name}
                    </button>
                  ))}
                </div>
                {/* Custom color picker */}
                <div className="mt-3 pt-3 border-t border-[#8a9b50]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-[#8a9b50]" />
                    <p className="text-[#d4d8b8] font-bold text-xs">Color Personalizado</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => { setCustomColor(e.target.value); setUITheme('custom' as UITheme); applyCustomColor(e.target.value); }}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#8a9b50]/30"
                      style={{ padding: '2px' }}
                    />
                    <div className="flex-1">
                      <p className="text-[#6b7280] text-[10px]">Elige cualquier tono</p>
                      <p className="text-[#d4d8b8] font-mono text-xs">{customColor.toUpperCase()}</p>
                    </div>
                    {uiTheme === ('custom' as UITheme) && (
                      <div className="text-[#8a9b50] text-[10px] font-bold uppercase">Activo</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Performance tier selector */}
              <div className="w-full p-3 tac-btn rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="w-5 h-5 text-[#8a9b50]" />
                  <div className="text-left"><p className="text-[#d4d8b8] font-bold text-sm">Rendimiento Grafico</p><p className="text-[#6b7280] text-xs">Ajusta para tu dispositivo</p></div>
                </div>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as PerformanceTier[]).map((t) => (
                    <button key={t} onClick={() => { setPerformanceTier(t); setPerfTierState(t); }} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-colors ${perfTier === t ? 'bg-[#8a9b50]/20 text-[#8a9b50] border border-[#8a9b50]/40' : 'tac-btn text-[#6b7280]'}`}>
                      {t === 'low' ? 'Baja' : t === 'medium' ? 'Media' : 'Alta'}
                    </button>
                  ))}
                </div>
                <p className="text-[#6b7280] text-[10px] mt-2">
                  {perfTier === 'low' ? 'Sin partículas ni efectos de brillo. Ideal para celulares lentos.' : perfTier === 'medium' ? 'Partículas limitadas. Balance entre calidad y rendimiento.' : 'Maxima calidad visual con todos los efectos activos.'}
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-[#6b7280] text-xs">&copy; 2026</p>
          </div>
        </div>
      )}
    </div>
  );
}
