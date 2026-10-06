'use client';

import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, serverTimestamp, collection, addDoc } from 'firebase/firestore';

export interface SessionStats {
  mode: string;
  sessionStartMs: number;
  durationMs: number;
  gamesStarted: number;
  gamesFinished: number;
  coinsFromGameplay: number;
  coinsFromAds: number;
  campaignLevelStarted: number;
  campaignLevelCompleted: number;
  score: number;
}

const LOCAL_KEY = 'garrdash_session_stats';

export function initSessionStats(mode: string, campaignLevel = 0): SessionStats {
  const stats: SessionStats = {
    mode,
    sessionStartMs: Date.now(),
    durationMs: 0,
    gamesStarted: 1,
    gamesFinished: 0,
    coinsFromGameplay: 0,
    coinsFromAds: 0,
    campaignLevelStarted: campaignLevel,
    campaignLevelCompleted: 0,
    score: 0,
  };
  saveLocal(stats);
  return stats;
}

export function loadLocalSession(): SessionStats | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveLocal(stats: SessionStats) {
  if (typeof window === 'undefined') return;
  try { sessionStorage.setItem(LOCAL_KEY, JSON.stringify(stats)); } catch {}
}

export function updateSessionStats(partial: Partial<SessionStats>) {
  const current = loadLocalSession();
  if (!current) return;
  const next = { ...current, ...partial, durationMs: Date.now() - current.sessionStartMs };
  saveLocal(next);
}

export function addCoinsToSession(gameplay: number, ads: number) {
  const current = loadLocalSession();
  if (!current) return;
  current.coinsFromGameplay += gameplay;
  current.coinsFromAds += ads;
  saveLocal(current);
}

export function finishGameSession(score: number, completed: boolean, campaignLevelCompleted = 0) {
  const current = loadLocalSession();
  if (!current) return;
  if (completed) current.gamesFinished += 1;
  current.score = score;
  current.durationMs = Date.now() - current.sessionStartMs;
  if (campaignLevelCompleted > 0) current.campaignLevelCompleted = campaignLevelCompleted;
  saveLocal(current);
  syncSessionToFirestore(current);
}

export function abandonSession() {
  const current = loadLocalSession();
  if (!current) return;
  if (current.gamesFinished > 0) return;
  current.durationMs = Date.now() - current.sessionStartMs;
  saveLocal(current);
  syncSessionToFirestore(current);
}

async function syncSessionToFirestore(stats: SessionStats) {
  try {
    const uid = (await import('firebase/auth')).getAuth()?.currentUser?.uid;
    if (!uid) return;
    await addDoc(collection(db, 'game_sessions'), {
      userId: uid,
      mode: stats.mode,
      durationMs: stats.durationMs,
      gamesStarted: stats.gamesStarted,
      gamesFinished: stats.gamesFinished,
      coinsFromGameplay: stats.coinsFromGameplay,
      coinsFromAds: stats.coinsFromAds,
      campaignLevelStarted: stats.campaignLevelStarted,
      campaignLevelCompleted: stats.campaignLevelCompleted,
      score: stats.score,
      date: serverTimestamp(),
    });
  } catch {}
}
