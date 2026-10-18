'use client';

import { isProduction } from '@/lib/ad-security';

// Recompensas por progreso de los minijuegos nuevos (Rompebloques, Torre Perfecta).
//
// PROBLEMA DE SEGURIDAD: addCoins escribe el saldo directamente desde el cliente
// (Firestore increment desde la app, sin endpoint que valide la partida). Cualquier
// cliente modificado podria acreditar monedas canjeables por diamantes de Free Fire
// con cantidades arbitrarias. Mientras no exista validacion server-side de las
// partidas, estas recompensas quedan como PENDIENTES/simuladas: se calculan y se
// muestran al jugador, pero NO se acreditan al saldo real.
export function isArcadeProgressRewardEnabled(): boolean {
  return !isProduction();
}

// ---------------------------------------------------------------------------
// Rompebloques Neón: bloques destruidos + niveles superados (sin progreso = 0)
// ~10 monedas por nivel + 0.3 por bloque resistente roto, mas nivel bonus.
// Buena partida de 2-3 min (3 niveles): ~30-40 monedas.
// ---------------------------------------------------------------------------
export function neonBreakerCoins(blocksDestroyed: number, levelsCleared: number, maxLevel: number): number {
  if (isArcadeProgressRewardEnabled()) {
    if (blocksDestroyed <= 0 && levelsCleared <= 0) return 0;
    // Tasa decreciente para evitar inflacion en partidas largas
    const blockCoins = Math.floor(blocksDestroyed * 0.35);
    const levelCoins = levelsCleared * 10;
    const cap = 10 + maxLevel * 10;
    return Math.min(cap, blockCoins + levelCoins);
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Torre Perfecta: bloques colocados + perfectos (sin progreso = 0)
// 1 moneda por 2 bloques colocados + 2 por perfecto. Cap decreciente suave.
// Buena partida de 2-3 min (~20-30 bloques, 6-10 perfectos): ~30-45 monedas.
// ---------------------------------------------------------------------------
export function towerCoins(blocksPlaced: number, perfects: number): number {
  if (isArcadeProgressRewardEnabled()) {
    if (blocksPlaced <= 0) return 0;
    const base = Math.floor(blocksPlaced / 2);
    const perfectBonus = perfects * 2;
    // Tasa decreciente: a partir de 40 bloques la contribucion se reduce a la mitad
    const diminishing = blocksPlaced > 40 ? Math.floor((blocksPlaced - 40) / 4) : 0;
    return Math.min(60, base + perfectBonus + diminishing);
  }
  return 0;
}
