'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Download, Coins, Lock, Clock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';

export function OfferwallScreen() {
  const { setScreen, offerwallConfig, offerwallDownloadsToday, recordOfferwallDownload, isOnline } = useGame();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const ms = tomorrow.getTime() - now.getTime();
      const h = Math.floor(ms / (1000 * 60 * 60));
      const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((ms % (1000 * 60)) / 1000);
      setTimeUntilReset(`${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const isActive = offerwallConfig?.active ?? false;
  const hasLink = !!(offerwallConfig?.link);
  const dailyLimit = offerwallConfig?.dailyLimit ?? 2;
  const reward = offerwallConfig?.rewardPerDownload ?? 1000;
  const limitReached = offerwallDownloadsToday >= dailyLimit;

  const handleDownload = async () => {
    setResult(null);
    const res = await recordOfferwallDownload();
    setResult(res);
    if (res.ok && hasLink && isActive) {
      window.open(offerwallConfig!.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <OfflineBanner />
      <MuteButton />

      <div className="pt-16 px-6 pb-28 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-xl">Misiones de Descarga</h1>
        </div>

        <div className="max-w-sm mx-auto w-full flex-1 flex flex-col">
          {!isActive || !hasLink ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
                <Lock className="w-10 h-10 text-white/30" />
              </div>
              <h2 className="text-white/60 font-bold text-lg mb-2">Proximamente</h2>
              <p className="text-white/30 text-sm">Las misiones de descarga estaran disponibles muy pronto. ¡Vuelve mas tarde!</p>
            </div>
          ) : limitReached ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
                <Clock className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-amber-400 font-bold text-lg mb-2">Limite alcanzado</h2>
              <p className="text-white/50 text-sm mb-4">¡Vuelve manana por mas!</p>
              <div className="px-4 py-2 rounded-xl bg-card border border-border">
                <p className="text-white/40 text-xs">Reinicio en:</p>
                <p className="text-cyan-400 font-mono font-bold text-lg">{timeUntilReset}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Reward info card */}
              <div className="rounded-2xl bg-gradient-to-br from-cyan-900/30 to-card border border-cyan-500/30 p-5 mb-4 shadow-lg shadow-cyan-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold">Recompensa por descarga</h2>
                    <p className="text-cyan-400 font-bold text-lg">{reward.toLocaleString()} monedas</p>
                  </div>
                </div>
                <p className="text-white/40 text-xs">Completa la descarga y validacion para recibir tus monedas.</p>
              </div>

              {/* Daily limit tracker */}
              <div className="rounded-2xl bg-card border border-border p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm font-bold">Descargas de hoy</span>
                  <span className="text-white font-bold">{offerwallDownloadsToday} / {dailyLimit}</span>
                </div>
                <div className="h-3 rounded-full bg-background overflow-hidden">
                  <div className="h-full transition-all duration-300" style={{ width: `${(offerwallDownloadsToday / dailyLimit) * 100}%`, background: 'linear-gradient(90deg, #22d3ee, #34d399)' }} />
                </div>
                <p className="text-white/30 text-xs mt-2">Maximo {dailyLimit} descargas premiadas al dia = {(reward * dailyLimit).toLocaleString()} monedas diarias.</p>
              </div>

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={!isOnline}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Download className="w-6 h-6" />
                {isOnline ? 'Iniciar descarga' : 'Requiere conexion a Internet'}
              </button>

              {result?.ok && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-green-400 text-sm animate-scale-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ¡Descarga completada! +{reward.toLocaleString()} monedas acreditadas.
                </div>
              )}
              {result && !result.ok && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {result.error}
                </div>
              )}

              {/* Info */}
              <div className="mt-6 rounded-xl bg-card border border-border p-4 text-xs space-y-2">
                <p className="text-white/50 font-bold mb-1">Como funciona:</p>
                <p className="text-white/40">1. Presiona "Iniciar descarga" para ir a la oferta.</p>
                <p className="text-white/40">2. Completa la descarga e instalacion de la app ofrecida.</p>
                <p className="text-white/40">3. Abre la app y manténla abierta el tiempo requerido.</p>
                <p className="text-white/40">4. Vuelve a GARRDASHPE y tus monedas se acreditaran automaticamente.</p>
              </div>

              {/* Reset timer */}
              <div className="mt-4 flex items-center justify-center gap-2 text-white/30 text-xs">
                <Clock className="w-3 h-3" />
                <span>El contador se reinicia a la medianoche: {timeUntilReset}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
