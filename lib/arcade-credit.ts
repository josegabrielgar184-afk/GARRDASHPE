'use client';

import { auth } from '@/lib/firebase';

const CREDIT_ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/arcade-credit`;

export type ArcadeGame = 'neonbreaker' | 'tower' | 'canicas';

export interface CreditResult {
  ok: boolean;
  credited: number;
  duplicate?: boolean;
  capped?: boolean;
  cap_limit?: number;
  firestore_credited?: boolean;
  // Cierto cuando el servidor valido el monto pero no pudo abonar en Firestore
  // (Admin SDK no disponible en cold start). El cliente debe usar addCoins() con
  // el monto aprobado para completar el abono en la cartera real de Firebase.
  client_fallback?: boolean;
}

// Pide al servidor que calcule y acredite la recompensa de una partida.
// El cliente envia solo metricas de progreso y el id unico de la partida;
// el monto lo decide el servidor. Falla de forma segura: sin acreditacion
// local si el servidor no responde o rechaza.
export async function requestArcadeCredit(
  game: ArcadeGame,
  sessionId: string,
  metrics: Record<string, number>,
): Promise<CreditResult> {
  const user = auth.currentUser;
  if (!user) return { ok: false, credited: 0 };
  try {
    // Fuerza el refresh del token: en la WebView de Capacitor (Android) el
    // token en cache puede estar expirado y getIdToken() sin flag puede
    // devolver un token invalido o lanzar. Con true se solicita uno nuevo.
    const token = await user.getIdToken(true);
    const res = await fetch(CREDIT_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game, session_id: sessionId, metrics }),
    });
    if (!res.ok) return { ok: false, credited: 0 };
    const data = await res.json();
    if (data && data.ok === true && typeof data.credited === 'number') {
      return {
        ok: true,
        credited: data.credited,
        duplicate: data.duplicate === true,
        capped: data.capped === true,
        cap_limit: typeof data.cap_limit === 'number' ? data.cap_limit : undefined,
        firestore_credited: data.firestore_credited === true,
        client_fallback: data.client_fallback === true,
      };
    }
    return { ok: false, credited: 0 };
  } catch {
    return { ok: false, credited: 0 };
  }
}

export function newSessionId(): string {
  return `s-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

// --- Estimacion en vivo (espejo de las formulas del servidor) ---
// Usadas solo para mostrar un contador estimado durante la partida. El monto
// final siempre lo decide el servidor en requestArcadeCredit.

export function estimateNeonBreakerCoins(blocksDestroyed: number, levelsCleared: number, maxLevel: number): number {
  if (blocksDestroyed <= 0 && levelsCleared <= 0) return 0;
  const blockCoins = Math.floor(blocksDestroyed * 0.35);
  const levelCoins = levelsCleared * 10;
  const cap = 10 + maxLevel * 10;
  return Math.min(cap, blockCoins + levelCoins);
}

export function estimateTowerCoins(blocksPlaced: number): number {
  if (blocksPlaced <= 0) return 0;
  return Math.floor(blocksPlaced / 2);
}

export function estimateCanicasCoins(explosions: number): number {
  if (explosions <= 0) return 0;
  return Math.min(20, Math.floor(explosions));
}

export type RewardStatus = 'idle' | 'loading' | 'credited' | 'pending' | 'failed' | 'none';

export interface RewardDisplay {
  status: RewardStatus;
  amount: number;
}

export function describeReward(r: RewardDisplay): { label: string; color: string } {
  switch (r.status) {
    case 'credited':
      return { label: `+${r.amount} monedas acreditadas`, color: 'text-green-400' };
    case 'pending':
      return { label: `${r.amount} monedas pendientes`, color: 'text-amber-400' };
    case 'failed':
      return { label: 'No se pudo acreditar la recompensa', color: 'text-red-400' };
    case 'none':
      return { label: 'Sin recompensa esta partida', color: 'text-white/40' };
    case 'loading':
      return { label: 'Calculando recompensa...', color: 'text-white/50' };
    default:
      return { label: '', color: 'text-white/40' };
  }
}
