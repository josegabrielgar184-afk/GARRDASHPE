'use client';

import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';

export function VersionChecker() {
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    const checkAppVersion = async () => {
      try {
        const appInfo = await App.getInfo();
        const currentVersion = appInfo.version; 

        // Enlace corregido con tu usuario exacto de GitHub
        const res = await fetch(`https://josegabrielgar184-afk.github.io/GARRDASHPE/version.json?t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        const latestVersion = data.minVersion;

        if (latestVersion && currentVersion !== latestVersion) {
          setNeedsUpdate(true);
        }
      } catch (e) {
        console.error("No se pudo verificar la versión", e);
      }
    };

    checkAppVersion();
  }, []);

  if (!needsUpdate) return null;

  const handleOpenPlayStore = () => {
    window.open('https://play.google.com/store/apps/details?id=com.garricraft.garrdash', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md select-none">
      <div className="bg-[#1a1a28] border-2 border-cyan-500/50 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl shadow-cyan-500/20">
        <h2 className="text-white font-black text-xl uppercase tracking-widest mb-2">¡Actualización Requerida!</h2>
        <p className="text-white/60 text-xs mb-6">
          Hay una nueva versión obligatoria disponible en Google Play Store para corregir errores de la economía y mejorar el rendimiento.
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
