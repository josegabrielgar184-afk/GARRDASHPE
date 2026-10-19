'use client';

import { useState } from 'react';
import { Trophy, Coins, Video, X, Clock, Heart } from 'lucide-react';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { getRewardedAdId } from '@/lib/config';
import { isRewardedContinueEnabled } from '@/lib/continue-policy';

interface MiniGameOverModalProps {
  open: boolean;
  score: number;
  highScore: number;
  gamesPlayed: number;
  durationSec: number;
  onRestart: () => void;
  onExit: () => void;
  // True solo cuando el minijuego permite continuar y el jugador aun no uso su
  // unica continuation de la partida
  canContinue: boolean;
  onContinue: () => void;
  continueText?: string;
  userRole?: 'user' | 'operador' | 'admin';
  vip?: boolean;
  // Recompensa de monedas acreditada por el servidor.
  rewardStatus?: 'idle' | 'loading' | 'credited' | 'pending' | 'failed' | 'none';
  rewardAmount?: number;
  // Cierto cuando el tope diario redujo (no bloqueo) la recompensa.
  rewardCapped?: boolean;
  capLimit?: number;
}

export function MiniGameOverModal({
  open, score, highScore, gamesPlayed, durationSec,
  onRestart, onExit, canContinue, onContinue,
  continueText = 'Ver anuncio para continuar', userRole = 'user', vip = false,
  rewardStatus = 'idle', rewardAmount = 0, rewardCapped = false, capLimit,
}: MiniGameOverModalProps) {
  const [showAd, setShowAd] = useState(false);
  const [continueUsed, setContinueUsed] = useState(false);

  if (!open) return null;

  const handleContinueReward = () => {
    if (continueUsed) return;
    setContinueUsed(true);
    onContinue();
  };

  const adAvailable = isRewardedContinueEnabled() && canContinue && !continueUsed;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm mx-4 rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-red-500/30 p-6 text-center animate-scale-in shadow-2xl">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-[#ffb700]" />
          </div>
        </div>

        <h2 className="text-white font-black text-xl mb-1">
          {score > 0 && score >= highScore ? '¡NUEVO RECORD!' : 'PARTIDA TERMINADA'}
        </h2>
        <p className="text-white/40 text-xs mb-4">Partida #{gamesPlayed}</p>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="rounded-2xl bg-black/40 border border-white/10 p-2.5">
            <Trophy className="w-4 h-4 text-[#ffb700] mx-auto mb-1" />
            <p className="text-white/40 text-[9px] uppercase">Puntos</p>
            <p className="text-white font-black text-base">{score.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl bg-black/40 border border-[#00f3ff]/20 p-2.5">
            <Heart className="w-4 h-4 text-[#00f3ff] mx-auto mb-1" />
            <p className="text-white/40 text-[9px] uppercase">Récord</p>
            <p className="text-[#00f3ff] font-black text-base">{highScore.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl bg-black/40 border border-white/10 p-2.5">
            <Clock className="w-4 h-4 text-white/50 mx-auto mb-1" />
            <p className="text-white/40 text-[9px] uppercase">Duración</p>
            <p className="text-white/60 font-black text-base">{formatDuration(durationSec)}</p>
          </div>
        </div>

        {rewardStatus !== 'idle' && (
          <div className="mb-4">
            <div className={`rounded-2xl border p-3 flex items-center justify-center gap-2 ${
              rewardStatus === 'credited' ? 'bg-green-500/10 border-green-500/40'
              : rewardStatus === 'pending' ? 'bg-amber-500/10 border-amber-500/40'
              : rewardStatus === 'failed' ? 'bg-red-500/10 border-red-500/40'
              : rewardStatus === 'loading' ? 'bg-white/5 border-white/10'
              : 'bg-white/5 border-white/10'
            }`}>
              <Coins className={`w-4 h-4 ${
                rewardStatus === 'credited' ? 'text-green-400'
                : rewardStatus === 'pending' ? 'text-amber-400'
                : rewardStatus === 'failed' ? 'text-red-400'
                : 'text-white/50'
              }`} />
              <span className={`text-sm font-black ${
                rewardStatus === 'credited' ? 'text-green-400'
                : rewardStatus === 'pending' ? 'text-amber-400'
                : rewardStatus === 'failed' ? 'text-red-400'
                : 'text-white/60'
              }`}>
                {rewardStatus === 'loading' && 'Calculando recompensa...'}
                {rewardStatus === 'credited' && `+${rewardAmount} monedas acreditadas`}
                {rewardStatus === 'pending' && `${rewardAmount} monedas pendientes`}
                {rewardStatus === 'failed' && 'No se pudo acreditar la recompensa'}
                {rewardStatus === 'none' && 'Sin recompensa esta partida'}
              </span>
            </div>
            {rewardCapped && capLimit && (
              <p className="text-amber-400/80 text-[10px] mt-1.5">
                Tope diario alcanzado ({capLimit}/juego). La recompensa se redujo al cupo restante.
              </p>
            )}
          </div>
        )}

        <div className="space-y-2.5">
          {adAvailable && (
            <button
              onClick={() => setShowAd(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/40 text-green-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors active:scale-95"
            >
              <Video className="w-4 h-4" />
              {continueText}
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f3ff]/20 to-cyan-600/20 border border-[#00f3ff]/40 text-[#00f3ff] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00f3ff]/30 transition-colors active:scale-95"
          >
            <X className="w-4 h-4 rotate-90" />
            Jugar de nuevo
          </button>

          <button
            onClick={onExit}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 active:scale-95"
          >
            <X className="w-4 h-4" />
            Volver al Arcade
          </button>
        </div>
      </div>

      <RewardAdModal
        open={showAd}
        onClose={() => setShowAd(false)}
        onReward={handleContinueReward}
        title="Continuar partida"
        rewardText="Continuas donde estabas"
        adId={getRewardedAdId('revivir')}
        userRole={userRole}
        vip={vip}
        touchKey="minigame_continue"
      />
    </div>
  );
}

function formatDuration(sec: number): string {
  if (sec <= 0) return '-';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}
