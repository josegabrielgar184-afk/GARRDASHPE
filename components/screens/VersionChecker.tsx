'use client';

import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { APP_VERSION as FALLBACK_VERSION, PLAY_STORE_URL } from '@/lib/config';

export function VersionChecker() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [newVersionText, setNewVersionText] = useState('');

  useEffect(() => {
    const checkAppVersion = async () => {
      try {
        // Step 1: Get the REAL installed versionCode from the native APK.
        let installedVersionCode: number;
        let installedVersionName: string;

        if (Capacitor.isNativePlatform()) {
          try {
            const info = await App.getInfo();
            installedVersionCode = Number(info.build);
            installedVersionName = info.version;
            console.log('[VersionChecker] INSTALLED VERSION CODE:', installedVersionCode);
            console.log('[VersionChecker] INSTALLED VERSION NAME:', installedVersionName);
          } catch (err) {
            console.error('[VersionChecker] App.getInfo() failed, using fallback', err);
            installedVersionCode = FALLBACK_VERSION;
            installedVersionName = '';
          }
        } else {
          installedVersionCode = FALLBACK_VERSION;
          installedVersionName = '';
          console.log('[VersionChecker] Web platform, fallback version:', installedVersionCode);
        }

        // Step 2: Fetch remote minimum version with cache-busting.
        const res = await fetch(`https://josegabrielgar184-afk.github.io/GARRDASHPE/version.json?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          console.error('[VersionChecker] Remote version.json returned', res.status);
          return;
        }
        const data = await res.json();

        const minimumVersionCode = Number(data.minVersionCode);
        const minimumVersionName = data.minVersionName ?? '';

        console.log('[VersionChecker] MINIMUM VERSION CODE:', minimumVersionCode);
        console.log('[VersionChecker] MINIMUM VERSION NAME:', minimumVersionName);

        const updateRequired = installedVersionCode < minimumVersionCode;
        console.log('[VersionChecker] UPDATE REQUIRED:', updateRequired);

        if (updateRequired) {
          setNeedsUpdate(true);
          setNewVersionText(minimumVersionName);
        }
      } catch (e) {
        console.error('[VersionChecker] Version check failed, not blocking user', e);
      }
    };

    checkAppVersion();
  }, []);

  if (!needsUpdate) return null;

  const handleOpenPlayStore = () => {
    window.open(PLAY_STORE_URL, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md select-none">
      <div className="bg-[#1a1a28] border-2 border-cyan-500/50 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl shadow-cyan-500/20">
        <h2 className="text-white font-black text-xl uppercase tracking-widest mb-2">¡Actualización Requerida!</h2>

        <p className="text-white/60 text-xs mb-6">
          Hay una nueva versión obligatoria {newVersionText ? <span className="text-cyan-400 font-bold">({newVersionText})</span> : ''} disponible en Google Play Store para corregir errores de la economía y mejorar el rendimiento.
        </p>

        <button
          onClick={handleOpenPlayStore}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/30 active:scale-95 transition-all"
        >
          Actualizar en Play Store
        </button>
      </div>
    </div>
  );
}
