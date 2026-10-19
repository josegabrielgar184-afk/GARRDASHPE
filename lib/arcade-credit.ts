
'use client';

import { auth } from '@/lib/firebase';

// Dirección del servidor configurada al compilar en Appflow.
const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL || ''
).trim().replace(/\/+$/, '');

const CREDIT_ENDPOINT = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/arcade-credit`
  : '';

export type ArcadeGame = 'neonbreaker' | 'tower' | 'canicas';

export interface CreditResult {
  ok: boolean;
  credited: number;
  duplicate?: boolean;
  capped?: boolean;
  cap_limit?: number;
  firestore_credited?: boolean;
  client_fallback?: boolean;
  error_code?: string;
}

function failure(error_code: string): CreditResult {
  console.error('[GarrDash arcade-credit]', error_code);
  return { ok: false, credited: 0, error_code };
}

export async function requestArcadeCredit(
  game: ArcadeGame,
  sessionId: string,
  metrics: Record<string, number>,
): Promise<CreditResult> {

  if (!CREDIT_ENDPOINT) {
    return failure('MISSING_SUPABASE_URL');
  }

  const user = auth.currentUser;

  if (!user) {
    return failure('FIREBASE_USER_NOT_AUTHENTICATED');
  }

  let token: string;

  try {
    token = await user.getIdToken(true);
  } catch {
    return failure('FIREBASE_TOKEN_ERROR');
  }

  try {
    const res = await fetch(CREDIT_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        game,
        session_id: sessionId,
        metrics,
      }),
    });

    if (!res.ok) {
      return failure(`SERVER_HTTP_${res.status}`);
    }

    const data = await res.json();

    if (
      !data ||
      data.ok !== true ||
      typeof data.credited !== 'number' ||
      !Number.isFinite(data.credited) ||
      data.credited < 0
    ) {
      return failure('INVALID_SERVER_RESPONSE');
    }

    return {
      ok: true,
      credited: data.credited,
      duplicate: data.duplicate === true,
      capped: data.capped === true,
      cap_limit:
        typeof data.cap_limit === 'number'
          ? data.cap_limit
          : undefined,
      firestore_credited: data.firestore_credited === true,
      client_fallback: data.client_fallback === true,
    };

  } catch {
    return failure('NETWORK_OR_RESPONSE_ERROR');
  }
}

export function newSessionId(): string {
  return `s-${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e9
  ).toString(36)}`;
}

// Estimaciones visuales.
// El servidor sigue decidiendo la recompensa real.

export function estimateNeonBreakerCoins(
  blocksDestroyed: number,
  levelsCleared: number,
  maxLevel: number,
): number {
  if (blocksDestroyed <= 0 && levelsCleared <= 0) return 0;

  const blockCoins = Math.floor(blocksDestroyed * 0.35);
  const levelCoins = levelsCleared * 10;
  const cap = 10 + maxLevel * 10;

  return Math.min(cap, blockCoins + levelCoins);
}

export function estimateTowerCoins(
  blocksPlaced: number,
): number {
  if (blocksPlaced <= 0) return 0;
  return Math.floor(blocksPlaced / 2);
}

export function estimateCanicasCoins(
  explosions: number,
): number {
  if (explosions <= 0) return 0;
  return Math.min(20, Math.floor(explosions));
}

export type RewardStatus =
  | 'idle'
  | 'loading'
  | 'credited'
  | 'pending'
  | 'failed'
  | 'none';

export interface RewardDisplay {
  status: RewardStatus;
  amount: number;
}

export function describeReward(
  r: RewardDisplay,
): { label: string; color: string } {

  switch (r.status) {
    case 'credited':
      return {
        label: `+${r.amount} monedas acreditadas`,
        color: 'text-green-400',
      };

    case 'pending':
      return {
        label: `${r.amount} monedas pendientes`,
        color: 'text-amber-400',
      };

    case 'failed':
      return {
        label: 'No se pudo acreditar la recompensa',
        color: 'text-red-400',
      };

    case 'none':
      return {
        label: 'Sin recompensa esta partida',
        color: 'text-white/40',
      };

    case 'loading':
      return {
        label: 'Calculando recompensa...',
        color: 'text-white/50',
      };

    default:
      return {
        label: '',
        color: 'text-white/40',
      };
  }
}
