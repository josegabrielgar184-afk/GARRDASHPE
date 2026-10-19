'use client';

// Contador de partidas finalizadas por minijuego para mostrar anuncios
// intersticiales cada 4 partidas. Persiste en localStorage para conservar el
// contador despues de cerrar la app. Cada minijuego tiene su contador
// independiente. Solo cuentan partidas terminadas (no entradas al menu ni
// renders repetidos).

const ADS_EVERY = 4;
const KEY = 'garrdash_arcade_play_count';

type Counts = Record<string, number>;

function readCounts(): Counts {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as Counts : {};
  } catch {
    return {};
  }
}

function writeCounts(counts: Counts): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(counts));
  } catch {}
}

// Incrementa el contador de partidas del juego y retorna true si toca mostrar
// anuncio intersticial (cada ADS_EVERY partidas).
export function registerGameFinished(game: string): boolean {
  const counts = readCounts();
  const next = (counts[game] ?? 0) + 1;
  counts[game] = next;
  writeCounts(counts);
  return next % ADS_EVERY === 0;
}

// Devuelve cuantas partidas faltan para el proximo anuncio (para depuracion).
export function gamesUntilAd(game: string): number {
  const counts = readCounts();
  const current = counts[game] ?? 0;
  const mod = current % ADS_EVERY;
  return mod === 0 ? 0 : ADS_EVERY - mod;
}
