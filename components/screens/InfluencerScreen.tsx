'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import {
  ArrowLeft, Crown, Award, TrendingUp, Coins, Target, Zap, Gem,
  CheckCircle2, AlertCircle, Lock, Shield,
} from 'lucide-react';
import {
  INFLUENCER_MIN_RUNS, INFLUENCER_MIN_SCORE, INFLUENCER_MIN_BALANCE,
  INFLUENCER_MIN_WITHDRAW, INFLUENCER_RECENT_GAMES,
} from '@/lib/config';

export function InfluencerScreen() {
  const { setScreen, influencerInfo, refreshInfluencerInfo, requestInfluencerWithdraw } = useGame();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    refreshInfluencerInfo();
  }, [refreshInfluencerInfo]);

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount, 10);
    if (isNaN(amount) || amount < INFLUENCER_MIN_WITHDRAW) {
      setResult({ ok: false, error: `Minimo ${INFLUENCER_MIN_WITHDRAW} diamantes.` });
      return;
    }
    setWithdrawing(true);
    const res = await requestInfluencerWithdraw(amount);
    setWithdrawing(false);
    setResult(res);
    if (res.ok) setWithdrawAmount('');
  };

  if (!influencerInfo) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background">
        <Lock className="w-12 h-12 text-white/30 mb-3" />
        <p className="text-white/40 text-sm">Cargando informacion de creador...</p>
        <button onClick={() => setScreen('menu')} className="mt-6 px-6 py-2 rounded-xl bg-card border border-border text-white/60 text-sm">Volver</button>
      </div>
    );
  }

  const meetsRuns = influencerInfo.totalRuns >= INFLUENCER_MIN_RUNS;
  const meetsScore = influencerInfo.bestScore >= INFLUENCER_MIN_SCORE;
  const meetsBalance = influencerInfo.coins >= INFLUENCER_MIN_BALANCE;
  const meetsRecentGames = influencerInfo.recentGames >= INFLUENCER_RECENT_GAMES;

  const rankColors = {
    bronce: { bg: 'from-orange-700/30 to-card', border: 'border-orange-600/40', text: 'text-orange-400', icon: '🥉' },
    plata: { bg: 'from-slate-400/30 to-card', border: 'border-slate-300/40', text: 'text-slate-300', icon: '🥈' },
    oro: { bg: 'from-amber-500/30 to-card', border: 'border-amber-400/40', text: 'text-amber-400', icon: '🥇' },
  };
  const rc = rankColors[influencerInfo.rank];

  const requirements = [
    { label: `Partidas jugadas`, value: `${influencerInfo.totalRuns}/${INFLUENCER_MIN_RUNS}`, met: meetsRuns },
    { label: `Mejor puntuacion`, value: `${influencerInfo.bestScore.toLocaleString()}/${INFLUENCER_MIN_SCORE.toLocaleString()}`, met: meetsScore },
    { label: `Saldo en monedas`, value: `${influencerInfo.coins.toLocaleString()}/${INFLUENCER_MIN_BALANCE.toLocaleString()}`, met: meetsBalance },
    { label: `Partidas recientes (7 dias)`, value: `${influencerInfo.recentGames}/${INFLUENCER_RECENT_GAMES}`, met: meetsRecentGames },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <MuteButton />

      <div className="pt-16 px-4 pb-28 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Gem className="w-5 h-5 text-purple-400" />
            Panel de Creador
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          {/* Rank badge */}
          <div className={`rounded-2xl bg-gradient-to-br ${rc.bg} border ${rc.border} p-5 shadow-lg mb-4`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">{rc.icon}</div>
              <div className="flex-1">
                <p className="text-white/40 text-xs uppercase">Rango Actual</p>
                <p className={`font-bold text-xl ${rc.text}`}>{influencerInfo.rank.toUpperCase()}</p>
              </div>
              <Crown className={`w-8 h-8 ${rc.text}`} />
            </div>
            <p className="text-white/60 text-sm">Hola, <span className="text-white font-bold">{influencerInfo.nombre}</span></p>
          </div>

          {/* Balance */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-card border border-amber-500/30 p-3 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <div><p className="text-white/40 text-[10px]">Monedas</p><p className="text-amber-400 font-bold text-sm">{influencerInfo.coins.toLocaleString()}</p></div>
            </div>
            <div className="rounded-xl bg-card border border-cyan-500/30 p-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <div><p className="text-white/40 text-[10px]">Mejor Score</p><p className="text-cyan-400 font-bold text-sm">{influencerInfo.bestScore.toLocaleString()}</p></div>
            </div>
          </div>

          {/* Requirements */}
          <div className="rounded-2xl bg-card border border-border p-4 mb-4">
            <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-400" />Requisitos de Acceso</p>
            <div className="space-y-2">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-white/50">{req.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={req.met ? 'text-green-400 font-mono' : 'text-red-400 font-mono'}>{req.value}</span>
                    {req.met ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Withdrawal section */}
          <div className="rounded-2xl bg-card border border-purple-500/30 p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Gem className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-white font-bold">Retiro de Diamantes</h2>
                <p className="text-white/40 text-xs">Minimo {INFLUENCER_MIN_WITHDRAW} diamantes por retiro</p>
              </div>
            </div>

            {!influencerInfo.canWithdraw ? (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-center">
                <Lock className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 text-xs font-bold">No cumples los requisitos para retiro</p>
                <p className="text-white/40 text-xs mt-1">Completa todos los requisitos arriba para habilitar el retiro.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1 block">Cantidad de diamantes</label>
                  <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder={`Min: ${INFLUENCER_MIN_WITHDRAW}`} className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <button onClick={handleWithdraw} disabled={withdrawing || !withdrawAmount} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {withdrawing ? <Zap className="w-4 h-4 animate-pulse" /> : <Gem className="w-4 h-4" />}
                  {withdrawing ? 'Procesando...' : 'Solicitar Retiro'}
                </button>
              </div>
            )}

            {result?.ok && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-green-400 text-xs animate-scale-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Retiro solicitado. Recepcion en 24-72 horas.
              </div>
            )}
            {result && !result.ok && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {result.error}
              </div>
            )}
          </div>

          {/* Anti-cheat notice */}
          <div className="rounded-xl bg-background/40 border border-border p-3 mt-4">
            <p className="text-white/30 text-xs flex items-center gap-2"><Shield className="w-3 h-3" />Sistema anti-trampa basado en IP/ID. El fraude resultara en baneo permanente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
