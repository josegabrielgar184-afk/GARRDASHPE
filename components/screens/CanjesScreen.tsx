'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { CANJE_GAMES, CANJE_REWARDS, formatElapsed, formatCountdown, getDayLabel } from '@/lib/canjes';
import type { CanjeGameId } from '@/lib/canjes';
import { ArrowLeft, Coins, Key, Clock, AlertCircle, CheckCircle2, XCircle, Loader2, RefreshCw, ChevronDown } from 'lucide-react';

export function CanjesScreen() {
  const {
    setScreen, coins, campaignProgress, canjes, approvedCanjes,
    refreshCanjes, submitCanje, correctCanjeId, cancelCanje,
  } = useGame();
  const [selectedReward, setSelectedReward] = useState(CANJE_REWARDS[0].id);
  const [selectedGame, setSelectedGame] = useState<CanjeGameId>('free_fire');
  const [playerId, setPlayerId] = useState('');
  const [nick, setNick] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [correctingId, setCorrectingId] = useState<string | null>(null);
  const [correctPlayerId, setCorrectPlayerId] = useState('');
  const [showApproved, setShowApproved] = useState(false);

  useEffect(() => {
    refreshCanjes();
  }, [refreshCanjes]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeCanjes = canjes.filter((c) => c.status === 'pending_review' || c.status === 'waiting_correction');
  const myQueueEntries = activeCanjes.sort((a, b) => a.createdAt - b.createdAt);

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (playerId.trim().length < 4) { setError('Player ID demasiado corto (min 4).'); return; }
    if (nick.trim().length < 2) { setError('Nickname demasiado corto.'); return; }
    setSubmitting(true);
    const result = await submitCanje(selectedReward, selectedGame, playerId.trim(), nick.trim());
    setSubmitting(false);
    if (result.ok) {
      setSuccess('¡Canje enviado! Tu solicitud está en cola.');
      setPlayerId(''); setNick('');
    } else {
      setError(result.error || 'Error al enviar canje');
    }
  };

  const handleCorrect = async (canjeId: string) => {
    setError('');
    if (correctPlayerId.trim().length < 4) { setError('Nuevo Player ID demasiado corto.'); return; }
    const result = await correctCanjeId(canjeId, correctPlayerId.trim());
    if (result.ok) {
      setCorrectingId(null);
      setCorrectPlayerId('');
      setSuccess('ID corregido. Volves a la cola de revisión.');
    } else {
      setError(result.error || 'Error al corregir');
    }
  };

  const handleCancel = async (canjeId: string) => {
    if (!confirm('¿Cancelar este canje? Se devolverán todas tus monedas y llaves.')) return;
    const result = await cancelCanje(canjeId);
    if (result.ok) setSuccess('Canje cancelado. Recursos devueltos.');
    else setError(result.error || 'Error al cancelar');
  };

  const reward = CANJE_REWARDS.find((r) => r.id === selectedReward)!;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <MuteButton />

      <div className="pt-16 px-4 pb-28 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-xl" style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>CANJES Y RETIROS</h1>
          <button onClick={() => refreshCanjes()} className="ml-auto text-white/50 hover:text-white">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-md mx-auto">
          {/* Balance */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-card border border-amber-500/30 p-3 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <div><p className="text-white/40 text-[10px]">Monedas</p><p className="text-amber-400 font-bold">{coins.toLocaleString()}</p></div>
            </div>
            <div className="rounded-xl bg-card border border-purple-500/30 p-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" />
              <div><p className="text-white/40 text-[10px]">Llaves</p><p className="text-purple-400 font-bold">{campaignProgress.keys}</p></div>
            </div>
          </div>

          {/* Active canjes - Queue position cards */}
          {myQueueEntries.length > 0 && (
            <div className="mb-4 space-y-3">
              <h2 className="text-white/60 font-bold text-xs uppercase tracking-wider">Tus Solicitudes Activas</h2>
              {myQueueEntries.map((c, idx) => {
                const elapsed = now - c.createdAt;
                const isCorrection = c.status === 'waiting_correction';
                const deadline = c.correctionDeadline ?? 0;
                const remaining = deadline - now;
                const expired = isCorrection && remaining <= 0;
                return (
                  <div key={c.id} className={`rounded-2xl border p-4 shadow-lg ${isCorrection ? 'bg-red-950/30 border-red-500/50' : 'bg-card border-cyan-500/30'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${isCorrection ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="text-white font-bold text-sm">{c.selectedReward}</p>
                          <p className="text-white/40 text-[10px]">{CANJE_GAMES.find((g) => g.id === c.gameId)?.label}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isCorrection ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                        {isCorrection ? 'CORREGIR ID' : 'EN COLA'}
                      </span>
                    </div>

                    {/* Progress card */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-[10px]">
                      <div className="rounded-lg bg-background/50 p-2 text-center">
                        <p className="text-white/40">Espera</p>
                        <p className="text-white font-bold">{formatElapsed(elapsed)}</p>
                      </div>
                      <div className="rounded-lg bg-background/50 p-2 text-center">
                        <p className="text-white/40">Player ID</p>
                        <p className="text-white font-mono truncate">{c.playerID}</p>
                      </div>
                    </div>

                    {/* Correction countdown */}
                    {isCorrection && (
                      <div className={`rounded-xl p-3 mb-3 ${expired ? 'bg-red-500/20 border border-red-500/50' : 'bg-red-500/10 border border-red-500/30'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <p className="text-red-400 font-bold text-xs">{expired ? 'TIEMPO EXPIRADO' : 'CORRIGE TU ID'}</p>
                        </div>
                        <p className="text-white/60 text-[10px] mb-2">El operador indicó que tu ID es incorrecto. Tienes 2 horas para corregirlo o se cancelará.</p>
                        <p className="text-red-400 font-black text-lg text-center font-mono">{formatCountdown(Math.max(0, remaining))}</p>
                        {correctingId === c.id ? (
                          <div className="mt-2 space-y-2">
                            <input type="text" value={correctPlayerId} onChange={(e) => setCorrectPlayerId(e.target.value)} placeholder="Nuevo Player ID" className="w-full px-3 py-2 rounded-lg bg-background/60 border border-red-500/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                            <div className="flex gap-2">
                              <button onClick={() => handleCorrect(c.id)} className="flex-1 py-2 rounded-lg bg-green-500 text-white font-bold text-xs">Corregir</button>
                              <button onClick={() => { setCorrectingId(null); setCorrectPlayerId(''); }} className="px-3 py-2 rounded-lg bg-card border border-border text-white/60 text-xs">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => { setCorrectingId(c.id); setCorrectPlayerId(''); }} className="w-full mt-1 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 font-bold text-xs hover:bg-red-500/30">
                            Corregir mi ID
                          </button>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    {!isCorrection && (
                      <button onClick={() => handleCancel(c.id)} className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-xs hover:bg-red-500/20 flex items-center justify-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Cancelar Canje
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Approved canjes collapsible */}
          {approvedCanjes.length > 0 && (
            <div className="mb-4">
              <button onClick={() => setShowApproved(!showApproved)} className="w-full flex items-center justify-between rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-green-400 font-bold text-sm">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Canjes Aprobados ({approvedCanjes.length})</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showApproved ? 'rotate-180' : ''}`} />
              </button>
              {showApproved && (
                <div className="mt-2 space-y-2">
                  {approvedCanjes.map((c) => (
                    <div key={c.id} className="rounded-xl bg-card border border-green-500/20 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold text-xs">{c.selectedReward}</p>
                          <p className="text-white/40 text-[10px]">{c.playerID}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 text-[10px] font-bold">{c.approvedAt ? getDayLabel(c.approvedAt) : ''}</p>
                          <p className="text-white/40 text-[10px]">{c.approvedAt ? new Date(c.approvedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New canje form */}
          <div className="rounded-2xl bg-card border border-cyan-500/30 p-5 shadow-lg">
            <h2 className="text-white font-bold mb-4">Solicitar Canje</h2>

            {/* Game badge - Generic */}
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-card border border-orange-500/30 p-3">
              <span className="text-2xl">🔥</span>
              <span className="text-white font-bold text-sm">Canje de Diamantes</span>
            </div>

            {/* Reward select */}
            <label className="text-white/60 text-xs font-medium mb-1 block">Recompensa</label>
            <div className="space-y-2 mb-3">
              {CANJE_REWARDS.map((r) => {
                const canAfford = coins >= r.coinCost && campaignProgress.keys >= r.keyCost;
                return (
                  <button key={r.id} onClick={() => setSelectedReward(r.id)} disabled={!canAfford} className={`w-full p-3 rounded-xl text-left transition-colors border ${selectedReward === r.id ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-background/40 border-border'} ${!canAfford ? 'opacity-40' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-sm">{r.label}</span>

                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px]">
                      <span className="text-amber-400 flex items-center gap-1"><Coins className="w-3 h-3" /> {r.coinCost.toLocaleString()}</span>
                      <span className="text-purple-400 flex items-center gap-1"><Key className="w-3 h-3" /> {r.keyCost}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Player ID */}
            <div className="space-y-3 mb-3">
              <div>
                <label className="text-white/60 text-xs font-medium mb-1 block">Player ID *</label>
                <input type="text" value={playerId} onChange={(e) => setPlayerId(e.target.value)} placeholder="Ej: 1234567890" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              </div>
              <div>
                <label className="text-white/60 text-xs font-medium mb-1 block">In-Game Nickname *</label>
                <input type="text" value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Ej: ProGamer123" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Coins className="w-5 h-5" />}
              {submitting ? 'Enviando...' : `Canjear ${reward.label}`}
            </button>
          </div>

          {error && <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          {success && <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-green-400 text-sm"><CheckCircle2 className="w-4 h-4 shrink-0" />{success}</div>}
        </div>
      </div>
    </div>
  );
}
