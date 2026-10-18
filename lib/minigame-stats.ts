'use client';

// Récords y estadísticas locales por minijuego (récord, partidas, mejor duración)
export interface MiniGameStats {
  highScore: number;
  gamesPlayed: number;
  bestDurationSec: number;
}

const KEY_PREFIX = 'garrdash_minigame_stats_';

export function getMiniGameStats(gameId: string): MiniGameStats {
  if (typeof window === 'undefined') return { highScore: 0, gamesPlayed: 0, bestDurationSec: 0 };
  try {
    const raw = localStorage.getItem(KEY_PREFIX + gameId);
    if (!raw) return { highScore: 0, gamesPlayed: 0, bestDurationSec: 0 };
    const p = JSON.parse(raw);
    return {
      highScore: typeof p.highScore === 'number' ? p.highScore : 0,
      gamesPlayed: typeof p.gamesPlayed === 'number' ? p.gamesPlayed : 0,
      bestDurationSec: typeof p.bestDurationSec === 'number' ? p.bestDurationSec : 0,
    };
  } catch {
    return { highScore: 0, gamesPlayed: 0, bestDurationSec: 0 };
  }
}

export function recordMiniGameResult(gameId: string, score: number, durationSec: number): MiniGameStats {
  const cur = getMiniGameStats(gameId);
  const next: MiniGameStats = {
    highScore: Math.max(cur.highScore, score),
    gamesPlayed: cur.gamesPlayed + 1,
    bestDurationSec: Math.max(cur.bestDurationSec, Math.floor(durationSec)),
  };
  try {
    localStorage.setItem(KEY_PREFIX + gameId, JSON.stringify(next));
  } catch {}
  return next;
}

export function hasSeenInstructions(gameId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(KEY_PREFIX + gameId + '_seen') === '1';
  } catch {
    return false;
  }
}

export function markInstructionsSeen(gameId: string): void {
  try {
    localStorage.setItem(KEY_PREFIX + gameId + '_seen', '1');
  } catch {}
}
