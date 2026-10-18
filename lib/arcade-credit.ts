'use client';

import { auth } from '@/lib/firebase';

const CREDIT_ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/arcade-credit`;

export type ArcadeGame = 'neonbreaker' | 'tower' | 'canicas';

export interface CreditResult {
  ok: boolean;
  credited: number;
  duplicate?: boolean;
  capped?: boolean;
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
    const token = await user.getIdToken();
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
