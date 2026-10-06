'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export type AnalyticsPeriod = 'today' | '7d' | '30d';

export interface SessionDoc {
  id: string;
  userId: string;
  mode: string;
  durationMs: number;
  gamesStarted: number;
  gamesFinished: number;
  coinsFromGameplay: number;
  coinsFromAds: number;
  campaignLevelStarted: number;
  campaignLevelCompleted: number;
  score: number;
  date: number;
}

export interface ModeStats {
  mode: string;
  uniquePlayers: number;
  totalSessions: number;
  avgDurationMs: number;
  totalDurationMs: number;
  finished: number;
  notFinished: number;
  finishRate: number;
  coinsGameplay: number;
  coinsAds: number;
  coinsTotal: number;
}

export interface AnalyticsData {
  sessions: SessionDoc[];
  uniquePlayers: number;
  totalStarted: number;
  totalFinished: number;
  totalNotFinished: number;
  finishRate: number;
  avgDurationMs: number;
  totalDurationMs: number;
  coinsGameplay: number;
  coinsAds: number;
  coinsTotal: number;
  coinsPerHour: number;
  byMode: ModeStats[];
  campaignLevels: { level: number; started: number; completed: number; notFinished: number };
  retentionD1: number | null;
  retentionD7: number | null;
  retentionNote: string;
}

const MODE_LABELS: Record<string, string> = {
  'space': 'Espacio',
  'campaign': 'Campaña',
  'survival': 'Camino del Vicio',
  'garrblade': 'GarrBlade',
  'garrfly': 'Culebrita Neón',
  'neon-maze': 'Laberinto Neón',
  'zrunner': 'Z-Runner',
};

export function getModeLabel(mode: string): string {
  return MODE_LABELS[mode] ?? mode;
}

export function periodToStart(period: AnalyticsPeriod): Date {
  const now = new Date();
  if (period === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = period === '7d' ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function fetchAnalytics(period: AnalyticsPeriod): Promise<AnalyticsData> {
  const start = periodToStart(period);
  const startMs = start.getTime();

  let sessions: SessionDoc[] = [];

  try {
    const snap = await getDocs(query(
      collection(db, 'game_sessions'),
      where('date', '>=', start),
      orderBy('date', 'desc'),
      limit(1000),
    ));
    snap.forEach((d) => {
      const data = d.data();
      const rawDate = data.date;
      let dateMs: number;
      if (rawDate && typeof rawDate.toDate === 'function') dateMs = rawDate.toDate().getTime();
      else if (rawDate instanceof Date) dateMs = rawDate.getTime();
      else if (typeof rawDate === 'number') dateMs = rawDate;
      else if (data.createdAt && typeof data.createdAt.toDate === 'function') dateMs = data.createdAt.toDate().getTime();
      else dateMs = Date.now();
      sessions.push({
        id: d.id,
        userId: data.userId ?? '',
        mode: data.mode ?? 'unknown',
        durationMs: data.durationMs ?? 0,
        gamesStarted: data.gamesStarted ?? 1,
        gamesFinished: data.gamesFinished ?? 0,
        coinsFromGameplay: data.coinsFromGameplay ?? 0,
        coinsFromAds: data.coinsFromAds ?? 0,
        campaignLevelStarted: data.campaignLevelStarted ?? 0,
        campaignLevelCompleted: data.campaignLevelCompleted ?? 0,
        score: data.score ?? 0,
        date: dateMs,
      });
    });
  } catch {
    return {
      sessions: [],
      uniquePlayers: 0,
      totalStarted: 0,
      totalFinished: 0,
      totalNotFinished: 0,
      finishRate: 0,
      avgDurationMs: 0,
      totalDurationMs: 0,
      coinsGameplay: 0,
      coinsAds: 0,
      coinsTotal: 0,
      coinsPerHour: 0,
      byMode: [],
      campaignLevels: { level: 0, started: 0, completed: 0, notFinished: 0 },
      retentionD1: null,
      retentionD7: null,
      retentionNote: 'No se pudieron cargar las sesiones. Puede faltar el índice de Firestore.',
    };
  }

  const uniqueUserIds = new Set(sessions.map((s) => s.userId).filter(Boolean));
  const totalStarted = sessions.length;
  const totalFinished = sessions.filter((s) => s.gamesFinished > 0).length;
  const totalNotFinished = totalStarted - totalFinished;
  const totalDurationMs = sessions.reduce((sum, s) => sum + (s.durationMs || 0), 0);
  const avgDurationMs = totalStarted > 0 ? Math.floor(totalDurationMs / totalStarted) : 0;
  const coinsGameplay = sessions.reduce((sum, s) => sum + (s.coinsFromGameplay || 0), 0);
  const coinsAds = sessions.reduce((sum, s) => sum + (s.coinsFromAds || 0), 0);
  const coinsTotal = coinsGameplay + coinsAds;
  const totalHours = totalDurationMs / (1000 * 60 * 60);
  const coinsPerHour = totalHours > 0 ? Math.round((coinsTotal / totalHours) * 100) / 100 : 0;

  const modeMap = new Map<string, SessionDoc[]>();
  for (const s of sessions) {
    const arr = modeMap.get(s.mode) ?? [];
    arr.push(s);
    modeMap.set(s.mode, arr);
  }

  const byMode: ModeStats[] = Array.from(modeMap.entries()).map(([mode, docs]) => {
    const players = new Set(docs.map((d) => d.userId).filter(Boolean));
    const finished = docs.filter((d) => d.gamesFinished > 0).length;
    const notFinished = docs.length - finished;
    const dur = docs.reduce((s, d) => s + (d.durationMs || 0), 0);
    const cg = docs.reduce((s, d) => s + (d.coinsFromGameplay || 0), 0);
    const ca = docs.reduce((s, d) => s + (d.coinsFromAds || 0), 0);
    return {
      mode,
      uniquePlayers: players.size,
      totalSessions: docs.length,
      avgDurationMs: docs.length > 0 ? Math.floor(dur / docs.length) : 0,
      totalDurationMs: dur,
      finished,
      notFinished,
      finishRate: docs.length > 0 ? Math.round((finished / docs.length) * 100) : 0,
      coinsGameplay: cg,
      coinsAds: ca,
      coinsTotal: cg + ca,
    };
  }).sort((a, b) => b.totalSessions - a.totalSessions);

  const campaignSessions = sessions.filter((s) => s.mode === 'campaign');
  const levelMap = new Map<number, { started: number; completed: number; notFinished: number }>();
  for (const s of campaignSessions) {
    const lvl = s.campaignLevelStarted || 0;
    if (lvl <= 0) continue;
    const entry = levelMap.get(lvl) ?? { started: 0, completed: 0, notFinished: 0 };
    entry.started++;
    if (s.gamesFinished > 0) entry.completed++;
    else entry.notFinished++;
    levelMap.set(lvl, entry);
  }
  let campaignLevels = { level: 0, started: 0, completed: 0, notFinished: 0 };
  for (const [level, data] of Array.from(levelMap.entries())) {
    if (data.started > campaignLevels.started) {
      campaignLevels = { level, ...data };
    }
  }

  // Retention: check if we can compute D1/D7
  // We need users with sessions on day 0 and day 1 (or day 7)
  const userSessionDays = new Map<string, Set<number>>();
  for (const s of sessions) {
    if (!s.userId) continue;
    const dayKey = Math.floor(s.date / (24 * 60 * 60 * 1000));
    const days = userSessionDays.get(s.userId) ?? new Set<number>();
    days.add(dayKey);
    userSessionDays.set(s.userId, days);
  }

  let retentionD1: number | null = null;
  let retentionD7: number | null = null;
  let retentionNote = '';

  if (userSessionDays.size > 0) {
    let d1Returned = 0;
    let d7Returned = 0;
    let d1Total = 0;
    let d7Total = 0;

    for (const [uid, days] of Array.from(userSessionDays.entries())) {
      const sortedDays = Array.from(days).sort((a, b) => a - b);
      const firstDay = sortedDays[0];
      d1Total++;
      d7Total++;
      if (days.has(firstDay + 1)) d1Returned++;
      if (days.has(firstDay + 7)) d7Returned++;
    }

    if (d1Total > 0) retentionD1 = Math.round((d1Returned / d1Total) * 100);
    if (d7Total > 0) retentionD7 = Math.round((d7Returned / d7Total) * 100);
    retentionNote = `Calculado sobre ${d1Total} jugadores con sesiones en el periodo. D1: ${d1Returned}/${d1Total}, D7: ${d7Returned}/${d7Total}.`;
  } else {
    retentionNote = 'Sin sesiones suficientes para calcular retención en este periodo.';
  }

  return {
    sessions,
    uniquePlayers: uniqueUserIds.size,
    totalStarted,
    totalFinished,
    totalNotFinished,
    finishRate: totalStarted > 0 ? Math.round((totalFinished / totalStarted) * 100) : 0,
    avgDurationMs,
    totalDurationMs,
    coinsGameplay,
    coinsAds,
    coinsTotal,
    coinsPerHour,
    byMode,
    campaignLevels,
    retentionD1,
    retentionD7,
    retentionNote,
  };
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
  }
  return `${min}m ${sec}s`;
}
