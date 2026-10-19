'use client';

import { auth } from '@/lib/firebase';

const CLAIM_ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mission-claim`;

export function getWeekKey(d: Date = new Date()): string {
  const year = d.getUTCFullYear();
  const oneJan = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getUTCDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export interface MissionDef {
  id: string;
  label: string;
  description: string;
  reward: number;
  goals: Record<string, number>;
  goalUnit: string;
}

export const WEEKLY_MISSION: MissionDef = {
  id: 'weekly_all_modes',
  label: 'Desafío semanal',
  description: 'Alcanza el puntaje objetivo en cada modo y reclama 100 monedas',
  reward: 100,
  goals: {
    'space-game': 600,
    'zombie-game': 50,
    'survival': 60,
    'neon-maze': 200,
    'garrfly': 30,
    'neonbreaker': 200,
    'tower': 20,
    'canicas': 10,
  },
  goalUnit: 'pts',
};

export interface MissionProgress {
  progress: Record<string, number>;
  completed: boolean;
  claimed: boolean;
}

function supabaseHeaders(): Record<string, string> {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' };
}

export async function fetchMissionProgress(weekKey: string, missionId: string): Promise<MissionProgress> {
  const user = auth.currentUser;
  if (!user) return { progress: {}, completed: false, claimed: false };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  try {
    const res = await fetch(
      `${url}/rest/v1/weekly_mission_progress?select=progress,completed,claimed&uid=eq.${encodeURIComponent(user.uid)}&week_key=eq.${encodeURIComponent(weekKey)}&mission_id=eq.${encodeURIComponent(missionId)}`,
      { headers: supabaseHeaders() },
    );
    if (!res.ok) return { progress: {}, completed: false, claimed: false };
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return { progress: {}, completed: false, claimed: false };
    const r = rows[0];
    return {
      progress: (r.progress as Record<string, number>) ?? {},
      completed: r.completed ?? false,
      claimed: r.claimed ?? false,
    };
  } catch {
    return { progress: {}, completed: false, claimed: false };
  }
}

export async function recordMissionProgress(mode: string, value: number): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const weekKey = getWeekKey();
  const missionId = WEEKLY_MISSION.id;
  if (!(mode in WEEKLY_MISSION.goals)) return;

  const existing = await fetchMissionProgress(weekKey, missionId);
  const currentVal = existing.progress[mode] ?? 0;
  if (value <= currentVal) return;

  const newProgress = { ...existing.progress, [mode]: Math.max(currentVal, value) };
  const allCompleted = Object.entries(WEEKLY_MISSION.goals).every(([m, goal]) => (newProgress[m] ?? 0) >= goal);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  try {
    await fetch(`${url}/rest/v1/weekly_mission_progress`, {
      method: 'POST',
      headers: { ...supabaseHeaders(), Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        uid: user.uid,
        week_key: weekKey,
        mission_id: missionId,
        progress: newProgress,
        completed: allCompleted,
        claimed: existing.claimed,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch {}
}

export interface ClaimResult {
  ok: boolean;
  credited: number;
  duplicate?: boolean;
  client_fallback?: boolean;
}

export async function claimMission(weekKey: string, missionId: string): Promise<ClaimResult> {
  const user = auth.currentUser;
  if (!user) return { ok: false, credited: 0 };
  try {
    const token = await user.getIdToken(true);
    const res = await fetch(CLAIM_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission_id: missionId, week_key: weekKey }),
    });
    if (!res.ok) return { ok: false, credited: 0 };
    const data = await res.json();
    if (data && data.ok === true) {
      return {
        ok: true,
        credited: typeof data.credited === 'number' ? data.credited : 0,
        duplicate: data.duplicate === true,
        client_fallback: data.client_fallback === true,
      };
    }
    return { ok: false, credited: 0 };
  } catch {
    return { ok: false, credited: 0 };
  }
}
