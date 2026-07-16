'use client';

import { useState, useRef } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { ArrowLeft, Disc, Coins, Calendar, CheckCircle2, Crown, Gift } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';

interface Prize {
  coins: number;
  label: string;
  color: string;
  tier: 'high' | 'medium' | 'consolation';
}

const PRIZES: Prize[] = [
  { coins: 5, label: '5 Monedas', color: '#64748b', tier: 'consolation' },
  { coins: 10, label: '10 Monedas', color: '#3b82f6', tier: 'medium' },
  { coins: 5, label: '5 Monedas', color: '#64748b', tier: 'consolation' },
  { coins: 20, label: '20 Monedas', color: '#06b6d4', tier: 'medium' },
  { coins: 5, label: '5 Monedas', color: '#64748b', tier: 'consolation' },
  { coins: 50, label: '50 Monedas', color: '#10b981', tier: 'medium' },
  { coins: 5, label: '5 Monedas', color: '#64748b', tier: 'consolation' },
  { coins: 130, label: '130 Monedas', color: '#f59e0b', tier: 'high' },
  { coins: 5, label: '5 Monedas', color: '#64748b', tier: 'consolation' },
  { coins: 30, label: '30 Monedas', color: '#8b5cf6', tier: 'medium' },
  { coins: 5, label: '5 Monedas', color: '#64748b', tier: 'consolation' },
  { coins: 200, label: '200 Monedas', color: '#ef4444', tier: 'high' },
];

const PROB_HIGH = 0.009;
const PROB_MEDIUM = 0.20;
const PROB_CONSOLATION = 0.791;

export function RouletteScreen() {
  const { coins, addCoins, setScreen, vip, getFreeSpinsRemaining, recordRouletteSpin, isOnline } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [extraSpins, setExtraSpins] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const rotationRef = useRef(0);

  const freeSpinsRemaining = getFreeSpinsRemaining();
  const maxFree = vip ? 3 : 1;
  const canSpin = freeSpinsRemaining > 0 || extraSpins > 0;
  const isFreeSpin = freeSpinsRemaining > 0;

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
    setSpinning(true);
    setResult(null);

    const { prize, index } = selectPrize();
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = index * segmentAngle + segmentAngle / 2;
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotationRef.current + fullSpins * 360 + (360 - targetAngle);
    const startRotation = rotationRef.current;
    const duration = 3000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
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
        if (isFreeSpin) {
          recordRouletteSpin();
        } else {
          setExtraSpins((e) => e - 1);
        }
        setRefreshKey((k) => k + 1);
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <OfflineBanner />
      <MuteButton />
      <SuggestionButton onClick={() => setShowSuggestion(true)} />

      <div className="pt-16 px-6 pb-28 flex-1 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6 w-full max-w-sm">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-xl">Ruleta Diaria</h1>
        </div>

        <div className="max-w-sm w-full flex flex-col items-center">
          {/* Free spins status */}
          <div key={refreshKey} className="flex items-center gap-2 mb-4 animate-fade-in">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-white/60 text-sm">
              {freeSpinsRemaining > 0
                ? `${freeSpinsRemaining} giro${freeSpinsRemaining > 1 ? 's' : ''} gratis disponible${freeSpinsRemaining > 1 ? 's' : ''}`
                : 'Sin giros gratis hoy'}
            </span>
          </div>

          {/* VIP badge */}
          {vip && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-bold">VIP: 3 giros gratis diarios</span>
            </div>
          )}

          {/* Roulette wheel */}
          <div className="relative w-72 h-72 mb-6">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary" />
            </div>

            {/* Wheel */}
            <div
              className="relative w-full h-full rounded-full border-4 border-primary/30 shadow-2xl"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: `conic-gradient(${PRIZES.map((p, i) => {
                  const angle = 360 / PRIZES.length;
                  return `${p.color} ${i * angle}deg ${(i + 1) * angle}deg`;
                }).join(', ')})`,
              }}
            >
              {PRIZES.map((prize, i) => {
                const angle = (i * 360) / PRIZES.length + (360 / PRIZES.length) / 2;
                return (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 origin-top"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-120px)`,
                      transformOrigin: 'center',
                    }}
                  >
                    <span className="text-white text-[10px] font-bold drop-shadow-lg whitespace-nowrap">
                      {prize.coins}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center z-10">
              <Disc className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Spin button */}
          <button
            onClick={spin}
            disabled={spinning || !canSpin}
            className="w-full max-w-xs py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            {spinning ? 'Girando...' : canSpin ? (isFreeSpin ? `GIRAR GRATIS (${freeSpinsRemaining})` : `GIRAR (Extra: ${extraSpins})`) : 'Sin giros disponibles'}
          </button>

          {/* Extra spin via reward ad */}
          {freeSpinsRemaining === 0 && extraSpins === 0 && !spinning && (
            <button
              onClick={() => setShowReward(true)}
              disabled={!isOnline}
              className="w-full max-w-xs mt-3 py-3 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Gift className="w-4 h-4" />{isOnline ? 'Ver video para girar extra' : 'Requiere conexión a Internet'}
            </button>
          )}

          {/* Result */}
          {result && !spinning && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-green-400 text-sm animate-scale-in">
              <CheckCircle2 className="w-5 h-5" />
              ¡Ganaste {result.label}!
            </div>
          )}

          {/* Current coins */}
          <div className="mt-4 flex items-center gap-2 text-amber-400">
            <Coins className="w-5 h-5" />
            <span className="font-bold">{coins.toLocaleString()} monedas</span>
          </div>

          {!vip && (
            <p className="mt-4 text-white/30 text-xs text-center">
              Con VIP obtienes {maxFree} giros gratis diarios en lugar de 1
            </p>
          )}
        </div>
      </div>

      <RewardAdModal
        open={showReward}
        onClose={() => setShowReward(false)}
        onReward={() => setExtraSpins((e) => e + 1)}
        title="Giro Extra"
        rewardText="¡Has ganado un giro extra en la ruleta!"
      />
      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />
    </div>
  );
}
