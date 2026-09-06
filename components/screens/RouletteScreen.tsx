'use client';

import { useState, useRef, useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { InterstitialAd } from '@/components/game/InterstitialAd';
import { ADMOB_CONFIG } from '@/lib/config';
import { ArrowLeft, Coins, Calendar, CheckCircle2, Crown, Gift, Video, Sparkles, Zap } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import { playCoin, playPickup, initAudio, playExplosion } from '@/lib/audio';
import { hapticFeedback, hapticPattern } from '@/lib/engine2d';
import { getPerformanceTier } from '@/lib/performance';

interface Prize { coins: number; label: string; color: string; glow: string; tier: 'high' | 'medium' | 'consolation'; }
interface ConfettiPiece { id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; rot: number; rotVel: number; life: number; }

const PRIZES: Prize[] = [
    { coins: 5, label: '5 Monedas', color: '#64748b', glow: 'rgba(100,116,139,0.5)', tier: 'consolation' },
    { coins: 10, label: '10 Monedas', color: '#3b82f6', glow: 'rgba(59,130,246,0.6)', tier: 'medium' },
    { coins: 15, label: '15 Monedas', color: '#64748b', glow: 'rgba(100,116,139,0.5)', tier: 'consolation' },
    { coins: 20, label: '20 Monedas', color: '#06b6d4', glow: 'rgba(6,182,212,0.6)', tier: 'medium' },
    { coins: 10, label: '10 Monedas', color: '#64748b', glow: 'rgba(100,116,139,0.5)', tier: 'consolation' },
    { coins: 30, label: '30 Monedas', color: '#10b981', glow: 'rgba(16,185,129,0.6)', tier: 'medium' },
    { coins: 15, label: '15 Monedas', color: '#64748b', glow: 'rgba(100,116,139,0.5)', tier: 'consolation' },
    { coins: 50, label: '50 Monedas', color: '#f59e0b', glow: 'rgba(245,158,11,0.7)', tier: 'high' },
    { coins: 10, label: '10 Monedas', color: '#64748b', glow: 'rgba(100,116,139,0.5)', tier: 'consolation' },
    { coins: 25, label: '25 Monedas', color: '#8b5cf6', glow: 'rgba(139,92,246,0.6)', tier: 'medium' },
    { coins: 20, label: '20 Monedas', color: '#64748b', glow: 'rgba(100,116,139,0.5)', tier: 'consolation' },
    { coins: 100, label: '100 Monedas', color: '#ef4444', glow: 'rgba(239,68,68,0.7)', tier: 'high' },
];

const PROB_HIGH = 0.009;
const PROB_MEDIUM = 0.20;
const PROB_CONSOLATION = 0.791;

export function RouletteScreen() {
  const { coins, addCoins, setScreen, vip, userRole, getFreeSpinsRemaining, recordRouletteSpin, isOnline, canShowInterstitial, recordInterstitial } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [extraSpins, setExtraSpins] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [adSpins, setAdSpins] = useState(0);
  const rotationRef = useRef(0);
  const adDebounceRef = useRef(0);
  const confettiIdRef = useRef(0);
  const renderGlow = getPerformanceTier() === 'high';

  const freeSpinsRemaining = getFreeSpinsRemaining();
  const maxFree = vip ? 3 : 1;
  const canSpin = freeSpinsRemaining > 0 || extraSpins > 0 || adSpins > 0;
  const isFreeSpin = freeSpinsRemaining > 0;

  useEffect(() => {
    if (canShowInterstitial() && !vip) {
      setShowInterstitial(true);
      recordInterstitial();
    }
  }, []);

  const spawnConfetti = () => {
    const colors = ['#fbbf24', '#22d3ee', '#ef4444', '#34d399', '#a855f7', '#f97316'];
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: ++confettiIdRef.current,
        x: 150, y: 150,
        vx: (Math.random() - 0.5) * 10,
        vy: -Math.random() * 10 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        rotVel: (Math.random() - 0.5) * 0.4,
        life: 150,
      });
    }
    setConfetti(pieces);
  };

  useEffect(() => {
    if (confetti.length === 0) return;
    const interval = setInterval(() => {
      setConfetti((prev) => {
        const updated = prev.map((c) => ({ ...c, x: c.x + c.vx, y: c.y + c.vy, vy: c.vy + 0.3, rot: c.rot + c.rotVel, life: c.life - 1 })).filter((c) => c.life > 0 && c.y < 400);
        return updated;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [confetti.length > 0]);

  const selectPrize = (): { prize: Prize; index: number } => {
    const roll = Math.random();
    let tier: 'high' | 'medium' | 'consolation';
    if (roll < PROB_HIGH) tier = 'high';
    else if (roll < PROB_HIGH + PROB_MEDIUM) tier = 'medium';
    else tier = 'consolation';
    const candidates = PRIZES.map((p, i) => ({ p, i })).filter((x) => x.p.tier === tier);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    return { prize: chosen.p, index: chosen.i };
  };

  const spin = () => {
    if (spinning || !canSpin) return;
    initAudio();
    setSpinning(true);
    setResult(null);

    const { prize, index } = selectPrize();
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = index * segmentAngle + segmentAngle / 2;
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotationRef.current + fullSpins * 360 + (360 - targetAngle);
    const startRotation = rotationRef.current;
    const duration = 4000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = startRotation + (finalRotation - startRotation) * eased;
      rotationRef.current = current;
      setRotation(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        rotationRef.current = finalRotation % 360;
        setSpinning(false);
        setResult(prize);
        addCoins(prize.coins);
        playCoin();
        playPickup();
        hapticPattern([30, 20, 50]);
        if (prize.tier !== 'consolation') {
          spawnConfetti();
          playExplosion();
          hapticPattern([50, 30, 100]);
        }
        if (isFreeSpin) {
          recordRouletteSpin();
        } else if (extraSpins > 0) {
          setExtraSpins((e) => e - 1);
        } else {
          setAdSpins((e) => e - 1);
        }
        setRefreshKey((k) => k + 1);
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0a0e14] via-[#0f1520] to-[#1a1a28]">
      <OfflineBanner />
      <MuteButton />
      <SuggestionButton onClick={() => setShowSuggestion(true)} />

      {/* Ambient glow orbs - only on high perf */}
      {renderGlow && (
        <>
          <div className="absolute top-10 left-5 w-40 h-40 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #22d3ee, transparent)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-20 right-5 w-48 h-48 rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', filter: 'blur(50px)' }} />
        </>
      )}

      <div className="pt-16 px-6 pb-28 flex-1 flex flex-col items-center relative z-10">
        <div className="flex items-center gap-3 mb-6 w-full max-w-sm">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-white font-black text-xl uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', textShadow: renderGlow ? '0 0 20px rgba(245,158,11,0.6)' : 'none' }}>
            <Sparkles className="w-5 h-5 text-amber-400" /> Ruleta
          </h1>
        </div>

        <div className="max-w-sm w-full flex flex-col items-center">
          <div key={refreshKey} className="flex items-center gap-2 mb-4 animate-fade-in">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="text-white/60 text-sm">
              {freeSpinsRemaining > 0 ? `${freeSpinsRemaining} giro${freeSpinsRemaining > 1 ? 's' : ''} gratis disponible${freeSpinsRemaining > 1 ? 's' : ''}` : 'Sin giros gratis hoy'}
            </span>
          </div>

          {vip && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-none bg-amber-500/10 border-l-4 border-amber-500/60 mb-4" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}>
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wide">VIP: 3 giros gratis diarios</span>
            </div>
          )}

          {/* Wheel container - stencil style */}
          <div className="relative w-72 h-72 mb-6">
            {/* Outer glow ring - only on high */}
            {renderGlow && (
              <div className="absolute -inset-4 rounded-full pointer-events-none" style={{ background: 'conic-gradient(from 0deg, #22d3ee, #f59e0b, #ef4444, #8b5cf6, #22d3ee)', opacity: 0.3, filter: 'blur(15px)' }} />
            )}

            {/* Outer ring - angular stencil */}
            <div className="absolute inset-0 rounded-full" style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e, #1a1a2e)',
              boxShadow: renderGlow ? '0 0 30px rgba(245,158,11,0.3), inset 0 0 20px rgba(0,0,0,0.8)' : 'inset 0 0 20px rgba(0,0,0,0.8)',
              border: '4px solid rgba(245,158,11,0.4)',
            }}>
              {/* Stud decorations around the rim */}
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i * 360) / 16;
                return (
                  <div key={i} className="absolute w-2.5 h-2.5 rounded-full" style={{
                    top: '50%', left: '50%',
                    transform: `rotate(${angle}deg) translateY(-136px) translate(-50%, -50%)`,
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    boxShadow: renderGlow ? '0 0 6px rgba(251,191,36,0.6)' : 'none',
                  }} />
                );
              })}
            </div>

            {/* Pointer */}
            <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 z-30">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-amber-400" style={{ filter: renderGlow ? 'drop-shadow(0 0 8px rgba(251,191,36,0.8))' : 'none' }} />
            </div>

            {/* Spinning wheel */}
            <div
              className="absolute inset-3 rounded-full overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: `conic-gradient(${PRIZES.map((p, i) => {
                  const angle = 360 / PRIZES.length;
                  return `${p.color} ${i * angle}deg ${(i + 1) * angle}deg`;
                }).join(', ')})`,
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)',
                border: '3px solid rgba(255,255,255,0.15)',
              }}
            >
              {/* Segment dividers */}
              {PRIZES.map((_, i) => {
                const angle = (i * 360) / PRIZES.length;
                return (
                  <div key={i} className="absolute top-1/2 left-1/2 origin-left h-px" style={{
                    width: '50%',
                    transform: `rotate(${angle}deg)`,
                    background: 'rgba(255,255,255,0.15)',
                  }} />
                );
              })}

              {/* Prize labels */}
              {PRIZES.map((prize, i) => {
                const angle = (i * 360) / PRIZES.length + (360 / PRIZES.length) / 2;
                return (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 origin-center"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-100px)`,
                    }}
                  >
                    <span className="text-white text-[11px] font-black whitespace-nowrap block text-center" style={{ textShadow: '0 0 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)' }}>
                      {prize.coins}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Center hub - stencil */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center z-20" style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: '3px solid rgba(245,158,11,0.5)',
              boxShadow: renderGlow ? '0 0 20px rgba(245,158,11,0.4), inset 0 0 10px rgba(0,0,0,0.5)' : 'inset 0 0 10px rgba(0,0,0,0.5)',
            }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                boxShadow: renderGlow ? '0 0 15px rgba(251,191,36,0.6)' : 'none',
              }}>
                <Coins className="w-4 h-4 text-amber-900" />
              </div>
            </div>

            {confetti.map((c) => (
              <div
                key={c.id}
                className="absolute z-40 pointer-events-none"
                style={{
                  left: c.x, top: c.y,
                  width: c.size, height: c.size,
                  background: c.color,
                  transform: `rotate(${c.rot}rad)`,
                  opacity: c.life / 150,
                  borderRadius: '2px',
                  boxShadow: renderGlow ? `0 0 6px ${c.color}` : 'none',
                }}
              />
            ))}
          </div>

          {/* Spin button - stencil style */}
          <button
            onClick={spin}
            disabled={spinning || !canSpin}
            className="w-full max-w-xs py-4 rounded-none font-black text-lg uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canSpin && !spinning
                ? 'linear-gradient(135deg, #f59e0b, #ef4444, #f59e0b)'
                : 'linear-gradient(135deg, #374151, #1f2937)',
              color: '#fff',
              boxShadow: canSpin && !spinning && renderGlow
                ? '0 0 25px rgba(245,158,11,0.5), 0 4px 15px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                : '0 4px 10px rgba(0,0,0,0.3)',
              border: '2px solid rgba(255,255,255,0.2)',
              clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
            }}
          >
            {spinning ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" /> Girando...
              </span>
            ) : canSpin ? (
              isFreeSpin ? `GIRAR GRATIS (${freeSpinsRemaining})` : adSpins > 0 ? `GIRAR (Anuncio: ${adSpins})` : `GIRAR (Extra: ${extraSpins})`
            ) : 'Sin giros disponibles'}
          </button>

          {/* Infinite ad-based spin button - always available when no free/extra spins */}
          {freeSpinsRemaining === 0 && extraSpins === 0 && adSpins === 0 && !spinning && (
            <button
              onClick={() => {
                const now = Date.now();
                if (now - adDebounceRef.current < 4000) return;
                adDebounceRef.current = now;
                setShowReward(true);
              }}
              disabled={!isOnline}
              className="w-full max-w-xs mt-3 py-3 rounded-none bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ border: '2px solid rgba(255,255,255,0.15)', clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}
            >
              <Video className="w-4 h-4" />{isOnline ? 'Ver video para girar (ILIMITADO)' : 'Requiere conexión'}
            </button>
          )}

          {/* Show ad spins counter when active */}
          {adSpins > 0 && !spinning && (
            <div className="mt-2 flex items-center gap-1.5 text-green-400 text-xs font-bold uppercase tracking-wide">
              <Zap className="w-3.5 h-3.5" />
              Giros por anuncio: {adSpins}
            </div>
          )}

          {result && !spinning && (
            <div className="mt-4 flex items-center gap-2 rounded-none p-3 text-sm animate-scale-in" style={{
              background: `${result.color}15`,
              border: `2px solid ${result.color}`,
              borderLeftWidth: '4px',
              clipPath: 'polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
              boxShadow: renderGlow ? `0 0 20px ${result.glow}` : 'none',
            }}>
              <CheckCircle2 className="w-5 h-5" style={{ color: result.color }} />
              <span className="font-bold" style={{ color: result.color }}>¡Ganaste {result.label}!</span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-amber-400">
            <Coins className="w-5 h-5" />
            <span className="font-bold">{coins.toLocaleString()} monedas</span>
          </div>

          {!vip && (
            <p className="mt-4 text-white/30 text-xs text-center uppercase tracking-wide">
              Con VIP obtienes {maxFree} giros gratis diarios en lugar de 1
            </p>
          )}
        </div>
      </div>

      {showInterstitial && (
        <InterstitialAd onDone={() => setShowInterstitial(false)} />
      )}

      <RewardAdModal
        open={showReward}
        onClose={() => setShowReward(false)}
        onReward={() => setAdSpins((e) => e + 1)}
        title="Giro por Anuncio"
        rewardText="¡Giro ilimitado desbloqueado!"
        adId={ADMOB_CONFIG.ruletaId}
        userRole={userRole}
        vip={vip}
      />
      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />
    </div>
  );
}
