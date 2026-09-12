'use client';

import { useState, useRef, useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { ADMOB_CONFIG, getRewardedAdId } from '@/lib/config';
import { ArrowLeft, Calendar, Crown, Video, Sparkles } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import { playCoin, playPickup, initAudio, playExplosion } from '@/lib/audio';
import { hapticPattern } from '@/lib/engine2d';
import { getPerformanceTier } from '@/lib/performance';

interface Prize { coins: number; label: string; color: string; glow: string; tier: 'high' | 'medium' | 'consolation'; }
interface ConfettiPiece { id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; rot: number; rotVel: number; life: number; }

const PRIZES: Prize[] = [
    { coins: 5, label: '5', color: '#64748b', glow: 'rgba(100,116,139,0.5)', tier: 'consolation' },
    { coins: 10, label: '10', color: '#3b82f6', glow: 'rgba(59,130,246,0.6)', tier: 'medium' },
    { coins: 15, label: '15', color: '#64748b', glow: 'rgba(100,116,139,0.5)', tier: 'consolation' },
    { coins: 20, label: '20', color: '#06b6d4', glow: 'rgba(6,182,212,0.6)', tier: 'medium' },
    { coins: 10, label: '10', color: '#64748b', glow: 'rgba(100,116,139,0.5)', tier: 'consolation' },
    { coins: 30, label: '30', color: '#10b981', glow: 'rgba(16,185,129,0.6)', tier: 'medium' },
    { coins: 15, label: '15', color: '#64748b', glow: 'rgba(100,116,139,0.5)', tier: 'consolation' },
    { coins: 200, label: '200', color: '#f59e0b', glow: 'rgba(245,158,11,0.7)', tier: 'high' },
    { coins: 10, label: '10', color: '#64748b', glow: 'rgba(100,116,139,0.5)', tier: 'consolation' },
    { coins: 25, label: '25', color: '#8b5cf6', glow: 'rgba(139,92,246,0.6)', tier: 'medium' },
    { coins: 20, label: '20', color: '#64748b', glow: 'rgba(100,116,139,0.5)', tier: 'consolation' },
    { coins: 500, label: '500', color: '#ef4444', glow: 'rgba(239,68,68,0.7)', tier: 'high' },
];

const PROB_HIGH = 0.002;       // 0.2% de probabilidad para los premios gordos (200 y 500)
const PROB_MEDIUM = 0.10;      // 10% para premios medianos
const PROB_CONSOLATION = 0.898; // 89.8% para los de consolación

export function RouletteScreen() {
  const { addCoins, setScreen, vip, userRole, getFreeSpinsRemaining, recordRouletteSpin, canShowInterstitial, recordInterstitial } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [extraSpins, setExtraSpins] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [adSpins, setAdSpins] = useState(0);
  const rotationRef = useRef(0);
  const confettiIdRef = useRef(0);
  const renderGlow = getPerformanceTier() === 'high';

  const freeSpinsRemaining = getFreeSpinsRemaining();
  const canSpin = freeSpinsRemaining > 0 || extraSpins > 0 || adSpins > 0;
  const isFreeSpin = freeSpinsRemaining > 0;

  useEffect(() => {
    if (canShowInterstitial() && !vip) {
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
          setAdSpins((e) => Math.max(0, e - 1));
        }
        setRefreshKey((k) => k + 1);
      }
    };
    requestAnimationFrame(animate);
  };

  const handleRewardAdComplete = () => {
    setShowReward(false);
    setAdSpins((prev) => prev + 1);
    playPickup();
    hapticPattern([40, 40]);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0a0e14] via-[#0f1520] to-[#1a1a28]">
      <OfflineBanner />
      <MuteButton />
      <SuggestionButton onClick={() => setShowSuggestion(true)} />

      {renderGlow && (
        <>
          <div className="absolute top-10 left-5 w-40 h-40 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #22d3ee, transparent)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-20 right-5 w-48 h-48 rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', filter: 'blur(50px)' }} />
        </>
      )}

      <div className="pt-16 px-6 pb-16 flex-1 flex flex-col items-center relative z-10 overflow-y-auto no-scrollbar">
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
              {freeSpinsRemaining > 0 ? `${freeSpinsRemaining} giro${freeSpinsRemaining > 1 ? 's' : ''} gratis disponible${freeSpinsRemaining > 1 ? 's' : ''}` : adSpins > 0 ? `${adSpins} giro extra por anuncio` : 'Sin giros gratis hoy'}
            </span>
          </div>

          {vip && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-none bg-amber-500/10 border-l-4 border-amber-500/60 mb-4" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}>
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wide">VIP: 3 giros gratis diarios</span>
            </div>
          )}

          {/* Wheel container */}
          <div className="relative w-72 h-72 mb-6">
            {renderGlow && (
              <div className="absolute -inset-4 rounded-full pointer-events-none" style={{ background: 'conic-gradient(from 0deg, #22d3ee, #f59e0b, #ef4444, #8b5cf6, #22d3ee)', opacity: 0.3, filter: 'blur(15px)' }} />
            )}

            <div className="absolute inset-0 rounded-full" style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e, #1a1a2e)',
              boxShadow: renderGlow ? '0 0 30px rgba(245,158,11,0.3), inset 0 0 20px rgba(0,0,0,0.8)' : 'inset 0 0 20px rgba(0,0,0,0.8)',
              border: '4px solid rgba(245,158,11,0.4)',
            }}>
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

            <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 z-30">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-amber-400" style={{ filter: renderGlow ? 'drop-shadow(0 0 8px rgba(251,191,36,0.8))' : 'none' }} />
            </div>

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

              {/* Prize numbers */}
              {PRIZES.map((prize, i) => {
                const angle = (i * 360) / PRIZES.length + (360 / PRIZES.length) / 2;
                return (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-12 h-6 -ml-6 -mt-3 flex items-center justify-center font-black text-white text-xs drop-shadow-md"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-85px) rotate(90deg)`,
                    }}
                  >
                    {prize.label}
                  </div>
                );
              })}
            </div>

            <button
              onClick={spin}
              disabled={spinning || !canSpin}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex flex-col items-center justify-center z-20 font-black text-xs uppercase tracking-wider transition-transform active:scale-95 ${
                canSpin && !spinning ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/40 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              style={{ border: '3px solid rgba(255,255,255,0.3)' }}
            >
              {spinning ? 'GIRANDO' : 'GIRAR'}
            </button>
          </div>

          <button
            onClick={() => setShowReward(true)}
            className="w-full py-3 mb-4 rounded-none bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-cyan-500/30 transition-all active:scale-[0.98]"
            style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
          >
            <Video className="w-4 h-4" /> Ver Anuncio (Giro Extra)
          </button>

          {result && (
            <div className="w-full p-4 rounded-none bg-slate-900/90 border-l-4 border-amber-400 text-center animate-fade-in" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}>
              <p className="text-white/60 text-xs uppercase">Premio obtenido</p>
              <p className="text-amber-400 font-black text-lg">{result.label} Monedas</p>
            </div>
          )}
        </div>
      </div>

      <RewardAdModal
        open={showReward}
        onClose={() => setShowReward(false)}
        onReward={handleRewardAdComplete}
        title="Giro Extra por Anuncio"
        rewardText="Giro extra por ver anuncio"
        adId={getRewardedAdId('ruleta')}
        userRole={userRole}
        vip={vip}
        touchKey="roulette"
      />

      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />
    </div>
  );
}
