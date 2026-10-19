'use client';

import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface DPadProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  accent?: string;
}

// Cruceta compacta para controles de 4 direcciones. Cada boton es un area
// comoda de ~64px, con respuesta visual inmediata al presionar. Evita
// entradas dobles porque cada boton dispara su unica direccion.
export function ArcadeDPad({ onUp, onDown, onLeft, onRight, accent = '#00f3ff' }: DPadProps) {
  const base =
    'absolute w-[62px] h-[62px] rounded-xl flex items-center justify-center touch-none select-none ' +
    'bg-black/70 border shadow-md active:scale-90 active:brightness-150 transition-transform z-20 pointer-events-auto';

  const arrowCls = 'w-6 h-6';

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[196px] h-[196px] pointer-events-none">
      <button
        aria-label="Arriba"
        onPointerDown={(e) => { e.preventDefault(); onUp(); }}
        className={`${base} left-[67px] top-0`}
        style={{ borderColor: `${accent}66`, color: accent }}
      >
        <ArrowUp className={arrowCls} />
      </button>
      <button
        aria-label="Abajo"
        onPointerDown={(e) => { e.preventDefault(); onDown(); }}
        className={`${base} left-[67px] top-[67px]`}
        style={{ borderColor: `${accent}66`, color: accent }}
      >
        <ArrowDown className={arrowCls} />
      </button>
      <button
        aria-label="Izquierda"
        onPointerDown={(e) => { e.preventDefault(); onLeft(); }}
        className={`${base} left-0 top-[67px]`}
        style={{ borderColor: `${accent}66`, color: accent }}
      >
        <ArrowLeft className={arrowCls} />
      </button>
      <button
        aria-label="Derecha"
        onPointerDown={(e) => { e.preventDefault(); onRight(); }}
        className={`${base} left-[134px] top-[67px]`}
        style={{ borderColor: `${accent}66`, color: accent }}
      >
        <ArrowRight className={arrowCls} />
      </button>
    </div>
  );
}
