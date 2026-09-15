'use client';

import { useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Zap, Lock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import { auth } from '@/lib/firebase';

export function OfferwallScreen() {
  const { setScreen, isOnline } = useGame();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenOfferwall = () => {
    setResult(null);
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid ?? 'guest';
      
      // Usamos tu App ID oficial de AdGem (33565)
      const appId = '33565'; 
      const url = `https://api.adgem.com/v1/wall?appid=${appId}&player_id=${uid}`;
      
      // Abre el offerwall en una nueva pestaña
      window.open(url, '_blank');
      setResult({ ok: true });
    } catch {
      setResult({ ok: false, error: 'No se pudo abrir el offerwall de AdGem' });
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
          <h1 className="text-white font-bold text-xl">Misiones AdGem</h1>
        </div>

        <div className="max-w-sm mx-auto w-full flex-1 flex flex-col">
          {!isOnline ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
                <Lock className="w-10 h-10 text-white/30" />
              </div>
              <h2 className="text-white/60 font-bold text-lg mb-2">Requiere conexión</h2>
              <p className="text-white/30 text-sm">Necesitas internet para acceder a las ofertas.</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-gradient-to-br from-amber-900/30 to-card border border-amber-500/30 p-5 mb-4 shadow-lg shadow-amber-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold">Ofertas y Apps</h2>
                    <p className="text-amber-400 font-bold text-sm">Gana Monedas</p>
                  </div>
                </div>
                <p className="text-white/40 text-xs">Completa descargas y tareas para ganar recompensas en el juego.</p>
              </div>

              <button
                onClick={handleOpenOfferwall}
                disabled={loading || !isOnline}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <ExternalLink className="w-6 h-6" />
                {loading ? 'Abriendo...' : 'Abrir Offerwall AdGem'}
              </button>

              {result?.ok && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-green-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  Pestaña de ofertas abierta con éxito.
                </div>
              )}
              {result && !result.ok && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {result.error}
                </div>
              )}

              <div className="mt-6 rounded-xl bg-card border border-border p-4 text-xs space-y-2">
                <p className="text-white/50 font-bold mb-1">Cómo funciona:</p>
                <p className="text-white/40">1. Presiona &quot;Abrir Offerwall AdGem&quot;.</p>
                <p className="text-white/40">2. Completa una aplicación o tarea.</p>
                <p className="text-white/40">3. Las ganancias se registran para tu cuenta y la meta del panel.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
