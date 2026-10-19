'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Trophy, Gift, CheckCircle2, Target } from 'lucide-react';
import { getWeekKey, fetchMissionProgress, recordMissionProgress, claimMission, WEEKLY_MISSION, type MissionProgress } from '@/lib/missions';
import { useGame } from '@/hooks/use-game';

const MODE_LABELS: Record<string, string> = {
  'space-game': 'Espacio',
  'zombie-game': 'Zombies',
  'survival': 'Supervivencia',
  'neon-maze': 'Laberinto',
  'garrfly': 'Culebrita',
  'neonbreaker': 'Rompebloques',
  'tower': 'Torre',
  'canicas': 'Canicas',
};

export function MissionsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCoins } = useGame();
  const [progress, setProgress] = useState<MissionProgress>({ progress: {}, completed: false, claimed: false });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const weekKey = getWeekKey();

  const load = useCallback(async () => {
    setLoading(true);
    const p = await fetchMissionProgress(weekKey, WEEKLY_MISSION.id);
    setProgress(p);
    setClaimed(p.claimed);
    setLoading(false);
  }, [weekKey]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleClaim = async () => {
    if (claiming || claimed) return;
    setClaiming(true);
    const result = await claimMission(weekKey, WEEKLY_MISSION.id);
    if (result.ok && result.credited > 0) {
      if (result.client_fallback) {
        addCoins(result.credited, 'mission');
      }
      setClaimed(true);
    }
    setClaiming(false);
  };

  if (!open) return null;

  const goals = WEEKLY_MISSION.goals;
  const totalModes = Object.keys(goals).length;
  const doneModes = Object.entries(goals).filter(([m, g]) => (progress.progress[m] ?? 0) >= g).length;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in px-4">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-white font-black text-base">MISIONES</h2>
              <p className="text-white/40 text-[10px]">Ciclo: {weekKey}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center active:scale-95">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="rounded-2xl bg-black/40 border border-white/10 p-3 mb-3">
          <p className="text-white font-bold text-sm mb-1">{WEEKLY_MISSION.label}</p>
          <p className="text-white/50 text-[11px] leading-relaxed mb-2">{WEEKLY_MISSION.description}</p>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Gift className="w-3 h-3" /> +{WEEKLY_MISSION.reward} monedas
            </span>
            <span className="text-white/50">{doneModes}/{totalModes} modos</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all" style={{ width: `${(doneModes / totalModes) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-1.5 max-h-[40vh] overflow-y-auto">
          {loading ? (
            <p className="text-white/40 text-xs text-center py-4">Cargando progreso...</p>
          ) : (
            Object.entries(goals).map(([mode, goal]) => {
              const val = progress.progress[mode] ?? 0;
              const done = val >= goal;
              return (
                <div key={mode} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-3 py-2">
                  <span className="text-white/70 text-xs font-bold">{MODE_LABELS[mode] ?? mode}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono ${done ? 'text-green-400' : 'text-white/50'}`}>
                      {Math.min(val, goal)}/{goal}
                    </span>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={handleClaim}
          disabled={!progress.completed || claimed || claiming}
          className={`w-full mt-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            claimed
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : progress.completed && !claiming
              ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-400'
              : 'bg-white/5 border border-white/10 text-white/30'
          }`}
        >
          {claimed ? (
            <><Trophy className="w-4 h-4" /> Reclamado</>
          ) : claiming ? (
            'Reclamando...'
          ) : progress.completed ? (
            <><Gift className="w-4 h-4" /> Reclamar {WEEKLY_MISSION.reward} monedas</>
          ) : (
            'Completa todos los modos'
          )}
        </button>
      </div>
    </div>
  );
}

export { recordMissionProgress };
