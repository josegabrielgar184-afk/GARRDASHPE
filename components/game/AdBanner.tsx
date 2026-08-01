'use client';

import { useGame } from '@/hooks/use-game';
import { ADMOB_CONFIG, MODO_PRUEBA } from '@/lib/config';
import { Ban } from 'lucide-react';

export function AdBanner() {
  const { vip } = useGame();
  if (vip) return null;

  return (
    <div
      className="flex-shrink-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t-2 border-primary/30 flex items-center justify-center gap-2 px-4"
      style={{ height: '50px' }}
    >
      <Ban className="w-5 h-5 text-primary/60 shrink-0" />
      <div className="text-center">
        <p className="text-xs font-bold text-white/80">{MODO_PRUEBA ? 'AdMob (Test)' : 'Anuncio AdMob'}</p>
        <p className="text-[10px] text-white/40">Banner - Compra VIP para eliminar anuncios</p>
      </div>
      <div className="ml-auto text-[10px] text-primary/50 font-mono hidden sm:block">
        {MODO_PRUEBA ? 'TEST' : ADMOB_CONFIG.bannerId.slice(-10)}
      </div>
    </div>
  );
}
