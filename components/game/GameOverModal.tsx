'use client';

import { useState } from 'react';
import { Skull, Coins, Trophy, Video, Heart, X } from 'lucide-react';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { getRewardedAdId } from '@/lib/config';

interface GameOverModalProps {
  open: boolean;
  onClose: () => void;
  score: number;
  coinsEarned: number;
  onRevive: () => void;
  onDoubleCoins: () => void;
  userRole?: 'user' | 'operador' | 'admin';
  vip?: boolean;
}

export function GameOverModal({
  open, onClose, score, coinsEarned, onRevive, onDoubleCoins, userRole = 'user', vip = false,
}: GameOverModalProps) {
  const [showReviveAd, setShowReviveAd] = useState(false);
  const [showDoubleAd, setShowDoubleAd] = useState(false);
  const [coinsDoubled, setCoinsDoubled] = useState(false);

  if (!open) return null;

  const handleDoubleReward = () => {
    setCoinsDoubled(true);
    onDoubleCoins();
    setShowDoubleAd(false);
  };

  const handleReviveReward = () => {
    onRevive();
    setShowReviveAd(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm mx-4 rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-red-500/30 p-6 text-center animate-scale-in shadow-2xl">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <Skull className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <h2 className="text-white font-black text-2xl mb-1">GAME OVER</h2>
        <p className="text-white/40 text-xs mb-5">Tu partida ha terminado</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl bg-black/40 border border-white/10 p-3">
            <Trophy className="w-5 h-5 text-[#ffb700] mx-auto mb-1" />
            <p className="text-white/40 text-[10px] uppercase">Puntos</p>
            <p className="text-white font-black text-xl">{score.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl bg-black/40 border border-amber-500/20 p-3">
            <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-white/40 text-[10px] uppercase">Monedas</p>
            <p className="text-amber-400 font-black text-xl">
              {coinsDoubled ? (coinsEarned * 2).toLocaleString() : coinsEarned.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Rewarded buttons */}
        <div className="space-y-2.5 mb-4">
          {!coinsDoubled && (
            <button
              onClick={() => setShowDoubleAd(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-500/30 transition-colors active:scale-95"
            >
              <Video className="w-4 h-4" />
              VER ANUNCIO - Duplicar Monedas x2
            </button>
          )}

          <button
            onClick={() => setShowReviveAd(true)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/40 text-green-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors active:scale-95"
          >
            <Heart className="w-4 h-4" />
            REVIVIR - Continuar Partida (50% HP)
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Finalizar y volver
        </button>
      </div>

      <RewardAdModal
        open={showReviveAd}
        onClose={() => setShowReviveAd(false)}
        onReward={handleReviveReward}
        title="Revivir"
        rewardText="Has revivido con 50% de vida"
        adId={getRewardedAdId('revivir')}
        userRole={userRole}
        vip={vip}
        touchKey="revive_death"
      />

      <RewardAdModal
        open={showDoubleAd}
        onClose={() => setShowDoubleAd(false)}
        onReward={handleDoubleReward}
        title="Duplicar Monedas"
        rewardText={`+${coinsEarned} monedas extra!`}
        adId={getRewardedAdId('revivir')}
        userRole={userRole}
        vip={vip}
        touchKey="double_coins"
      />
    </div>
  );
}
