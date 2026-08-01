'use client';

import { useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Download, Coins, Lock, Clock, CheckCircle2, AlertCircle, ExternalLink, X } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import { BITLABS_CONFIG } from '@/lib/config';
import { auth } from '@/lib/firebase';

export function OfferwallScreen() {
  const { setScreen, isOnline } = useGame();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOfferwall, setShowOfferwall] = useState(false);

  const getBitlabsUrl = () => {
    const uid = auth.currentUser?.uid ?? 'guest';
    return `https://web.bitlabs.ai/offerwall?token=${BITLABS_CONFIG.integrationToken}&uid=${uid}`;
  };

  const handleOpenOfferwall = async () => {
    setResult(null);
    setLoading(true);
    try {
      setShowOfferwall(true);
      setResult({ ok: true });
    } catch {
      setResult({ ok: false, error: 'No se pudo abrir el offerwall' });
    }
    setLoading(false);
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
          <h1 className="text-white font-bold text-xl">Misiones BitLabs</h1>
        </div>

        <div className="max-w-sm mx-auto w-full flex-1 flex flex-col">
          {!isOnline ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
                <Lock className="w-10 h-10 text-white/30" />
              </div>
              <h2 className="text-white/60 font-bold text-lg mb-2">Requiere conexion</h2>
              <p className="text-white/30 text-sm">Necesitas internet para acceder a las misiones BitLabs.</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-gradient-to-br from-cyan-900/30 to-card border border-cyan-500/30 p-5 mb-4 shadow-lg shadow-cyan-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold">Misiones BitLabs</h2>
                    <p className="text-cyan-400 font-bold text-sm">Gana monedas reales</p>
                  </div>
                </div>
                <p className="text-white/40 text-xs">Completa encuestas, descarga apps y juega para ganar monedas. Las recompensas se acreditan automaticamente de forma segura.</p>
              </div>

              <button
                onClick={handleOpenOfferwall}
                disabled={loading || !isOnline}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <ExternalLink className="w-6 h-6" />
                {loading ? 'Abriendo...' : 'Abrir Offerwall'}
              </button>

              {result?.ok && !showOfferwall && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-green-400 text-sm animate-scale-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  Offerwall abierto. Las monedas se acreditaran automaticamente al completar misiones.
                </div>
              )}
              {result && !result.ok && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {result.error}
                </div>
              )}

              <div className="mt-6 rounded-xl bg-card border border-border p-4 text-xs space-y-2">
                <p className="text-white/50 font-bold mb-1">Como funciona:</p>
                <p className="text-white/40">1. Presiona "Abrir Offerwall" para ver las misiones disponibles.</p>
                <p className="text-white/40">2. Completa la mision (encuesta, descarga, juego, etc).</p>
                <p className="text-white/40">3. Las monedas se acreditan a tu cuenta automaticamente.</p>
                <p className="text-white/40">4. El sistema valida cada recompensa de forma 100% segura.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {showOfferwall && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/95 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
            <h2 className="text-white font-bold text-sm">BitLabs Offerwall</h2>
            <button
              onClick={() => setShowOfferwall(false)}
              className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <iframe
            src={getBitlabsUrl()}
            className="flex-1 w-full border-0"
            title="BitLabs Offerwall"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      )}
    </div>
  );
}
