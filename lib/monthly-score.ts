'use client';

import { auth } from '@/lib/firebase';

const ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/monthly-score`;

export type MonthlyMode =
  | 'space' | 'zombie' | 'survival' | 'campaign'
  | 'neonbreaker' | 'tower' | 'canicas'
  | 'garrblade' | 'garrfly' | 'zrunner' | 'neonline';

export interface MonthlyScoreResult {
  ok: boolean;
  credited: number;
  duplicate?: boolean;
  capped?: boolean;
  reason?: string;
  cap_limit?: number;
  month_key?: string;
  total_points?: number;
}

export interface MonthlyRankEntry {
  uid: string;
  player_name: string;
  total_points: number;
  matches_count: number;
}

function currentMonthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

// Pide al servidor que calcule y acredite los puntos mensuales de una partida.
// El cliente envia solo metricas de progreso + session_id; los puntos los
// decide el servidor. Falla de forma segura: sin acreditacion local si el
// servidor no responde o rechaza.
export async function submitMonthlyScore(
  mode: MonthlyMode,
  sessionId: string,
  metrics: Record<string, number>,
  rawScore = 0,
): Promise<MonthlyScoreResult> {
  const user = auth.currentUser;
  if (!user) return { ok: false, credited: 0 };
  try {
    const token = await user.getIdToken();
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode, session_id: sessionId, metrics, raw_score: rawScore }),
    });
    if (!res.ok) return { ok: false, credited: 0 };
    const data = await res.json();
    if (data && data.ok === true && typeof data.credited === 'number') {
      return {
        ok: true,
        credited: data.credited,
        duplicate: data.duplicate === true,
        capped: data.capped === true,
        reason: typeof data.reason === 'string' ? data.reason : undefined,
        cap_limit: typeof data.cap_limit === 'number' ? data.cap_limit : undefined,
        month_key: typeof data.month_key === 'string' ? data.month_key : undefined,
        total_points: typeof data.total_points === 'number' ? data.total_points : undefined,
      };
    }
    return { ok: false, credited: 0 };
  } catch {
    return { ok: false, credited: 0 };
  }
}

// Consulta el TOP mensual actual directamente desde Supabase (lectura publica
// via RLS). Devuelve hasta `limit` jugadores ordenados por total_points desc.
export async function fetchMonthlyRanking(limit = 50): Promise<MonthlyRankEntry[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !anonKey) return [];
  try {
    const mk = currentMonthKey();
    const res = await fetch(
      `${supabaseUrl}/rest/v1/monthly_totals?select=uid,player_name,total_points,matches_count&month_key=eq.${mk}&order=total_points.desc&limit=${limit}`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      },
    );
    if (!res.ok) return [];
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows.map((r: { uid: string; player_name: string; total_points: number; matches_count: number }) => ({
      uid: r.uid,
      player_name: r.player_name || 'Jugador',
      total_points: r.total_points ?? 0,
      matches_count: r.matches_count ?? 0,
    }));
  } catch {
    return [];
  }
}

// Consulta el lider del mes actual (TOP 1). Lo usa la pantalla principal
// en vez del global/top1 historico.
export async function fetchMonthlyLeader(): Promise<MonthlyRankEntry | null> {
  const rows = await fetchMonthlyRanking(1);
  return rows[0] ?? null;
}

// Consulta el total mensual del jugador actual para mostrar su posicion.
export async function fetchMyMonthlyTotal(uid: string): Promise<{ total_points: number; matches_count: number } | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !anonKey) return null;
  try {
    const mk = currentMonthKey();
    const res = await fetch(
      `${supabaseUrl}/rest/v1/monthly_totals?select=total_points,matches_count&month_key=eq.${mk}&uid=eq.${encodeURIComponent(uid)}`,
      {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return { total_points: 0, matches_count: 0 };
    return {
      total_points: rows[0].total_points ?? 0,
      matches_count: rows[0].matches_count ?? 0,
    };
  } catch {
    return null;
  }
}

export { currentMonthKey };
