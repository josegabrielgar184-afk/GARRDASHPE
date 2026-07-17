'use client';

import { useGame } from '@/hooks/use-game';
import { ADMOB_CONFIG, MODO_PRUEBA } from '@/lib/config';
import { Ban } from 'lucide-react';

interface AdBannerProps {
  position?: 'top' | 'bottom';
}

export function AdBanner({ position = 'bottom' }: AdBannerProps) {
  const { vip } = useGame();
  if (vip) return null;

  const isTop = position === 'top';
  const safeArea = isTop ? 'env(safe-area-inset-top)' : 'env(safe-area-inset-bottom)';
  const borderClass = isTop ? 'border-b-2' : 'border-t-2';

  return (
    <div
      className={`fixed ${isTop ? 'top-0' : 'bottom-0'} left-0 right-0 z-40 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 ${borderClass} border-primary/30 flex items-center justify-center gap-2 px-4`}
      style={{
        height: 'calc(var(--ad-banner-height) + ' + safeArea + ')',
        paddingTop: isTop ? safeArea : '0',
        paddingBottom: isTop ? '0' : safeArea,
      }}
    >
      <Ban className="w-5 h-5 text-primary/60 shrink-0" />
      <div className="text-center">
        <p className="text-xs font-bold text-white/80">{MODO_PRUEBA ? 'AdMob (Test)' : 'Anuncio AdMob'}</p>
        <p className="text-[10px] text-white/40">Banner publicitario - Compra VIP para eliminar anuncios</p>
      </div>
      <div className="ml-auto text-[10px] text-primary/50 font-mono hidden sm:block">
        {MODO_PRUEBA ? 'TEST' : ADMOB_CONFIG.bannerId.slice(-10)}
      </div>
    </div>
  );
}
