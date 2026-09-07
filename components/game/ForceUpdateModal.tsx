'use client';

import { ShieldAlert, Download, AlertTriangle } from 'lucide-react';
import { PLAY_STORE_URL } from '@/lib/config';

export function ForceUpdateModal({ minVersion, currentVersion }: { minVersion: number; currentVersion: number }) {
  const handleUpdate = () => {
    window.open(PLAY_STORE_URL, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-sm mx-4 animate-scale-in">
        {/* Tactical border frame */}
        <div className="absolute -inset-0.5 bg-gradient-to-b from-amber-500/30 to-red-900/20 rounded-2xl blur-sm" />

        <div className="relative rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-2xl shadow-amber-500/20">
          {/* Top stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

          {/* Warning icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-full border-2 border-amber-500/60 bg-amber-950/40 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-amber-400 font-black text-xl mb-2 tracking-wide">
            NUEVA ACTUALIZACION DISPONIBLE
          </h2>

          {/* Tactical divider */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-amber-500/30" />
            <AlertTriangle className="w-3 h-3 text-amber-500/50" />
            <div className="flex-1 h-px bg-amber-500/30" />
          </div>

          {/* Message */}
          <p className="text-center text-zinc-300 text-sm leading-relaxed mb-6">
            Hay mejoras criticas de seguridad y combate.
            <br />
            <span className="text-amber-400 font-bold">Actualiza para continuar.</span>
          </p>

          {/* Version info */}
          <div className="flex items-center justify-center gap-4 mb-6 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700">
              <span className="text-zinc-500">Actual: </span>
              <span className="text-zinc-300 font-mono font-bold">v{currentVersion}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-700/50">
              <span className="text-amber-600">Requerida: </span>
              <span className="text-amber-400 font-mono font-bold">v{minVersion}+</span>
            </div>
          </div>

          {/* Update button */}
          <button
            onClick={handleUpdate}
            className="w-full py-3.5 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-zinc-900 font-black text-base tracking-wide hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            ACTUALIZAR AHORA
          </button>

          {/* Footer hint */}
          <p className="text-center text-zinc-600 text-[10px] mt-4 tracking-wider">
            GOOGLE PLAY STORE
          </p>
        </div>
      </div>
    </div>
  );
}
