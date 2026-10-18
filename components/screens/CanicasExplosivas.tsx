'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Trophy, Pause, Play, RotateCcw, Circle } from 'lucide-react';

const W = 360;
const H = 480;
const MARBLE_R = 11;
const SPACING = MARBLE_R * 2 + 2;
const CHAIN_COUNT = 28;
const CHAIN_SPEED = 40;
const SHOT_SPEED = 400;
const COLORS = ['#00f3ff', '#ffb700', '#ff2d95'];

interface Marble { color: number; dist: number; }
interface Shot { x: number; y: number; vx: number; vy: number; color: number; }
interface Particle { x: number; y: number; vx: number; vy: number; color: string; life: number; }

type Status = 'ready' | 'playing' | 'paused' | 'won' | 'lost';

const CX = W / 2;
const CY = H * 0.4;
const MAX_R = Math.min(W, H) * 0.44;

const pathPts: Array<{ x: number; y: number }> = [];
for (let i = 0; i <= 600; i++) {
  const t = i / 600;
  const angle = -Math.PI / 2 + t * Math.PI * 4.6;
  const radius = MAX_R * (1 - t * 0.86);
  pathPts.push({ x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius });
}
const pathCum: number[] = [0];
for (let i = 1; i < pathPts.length; i++) {
  pathCum[i] = pathCum[i - 1] + Math.hypot(pathPts[i].x - pathPts[i - 1].x, pathPts[i].y - pathPts[i - 1].y);
}
const PATH_LEN = pathCum[pathCum.length - 1];
const SHOOTER = { x: W / 2, y: H - 48 };

function pointAt(dist: number): { x: number; y: number } {
  const d = Math.max(0, Math.min(PATH_LEN, dist));
  let lo = 0;
  let hi = pathCum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (pathCum[mid] < d) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const seg = Math.max(1e-6, pathCum[i] - pathCum[i - 1]);
  const t = (d - pathCum[i - 1]) / seg;
  return {
    x: pathPts[i - 1].x + (pathPts[i].x - pathPts[i - 1].x) * t,
    y: pathPts[i - 1].y + (pathPts[i].y - pathPts[i - 1].y) * t,
  };
}

const HOLE = pointAt(PATH_LEN);

export function CanicasExplosivas() {
  const { setScreen } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<Status>('ready');

  const marblesRef = useRef<Marble[]>([]);
  const shotRef = useRef<Shot | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const currentColorRef = useRef(0);
  const nextColorRef = useRef(1);
  const angleRef = useRef(-Math.PI / 2);
  const aimingRef = useRef(false);
  const scoreRef = useRef(0);
  const statusRef = useRef<Status>('ready');

  const setGameStatus = useCallback((s: Status) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const initGame = useCallback(() => {
    const marbles: Marble[] = [];
    for (let i = 0; i < CHAIN_COUNT; i++) {
      marbles.push({ color: Math.floor(Math.random() * COLORS.length), dist: -i * SPACING });
    }
    marblesRef.current = marbles;
    shotRef.current = null;
    particlesRef.current = [];
    currentColorRef.current = Math.floor(Math.random() * COLORS.length);
    nextColorRef.current = Math.floor(Math.random() * COLORS.length);
    scoreRef.current = 0;
    setScore(0);
    setGameStatus('ready');
  }, [setGameStatus]);

  useEffect(() => { initGame(); }, [initGame]);

  const spawnParticles = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * 90 + 30;
      particlesRef.current.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, color, life: 1 });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();

    const update = (dt: number) => {
      const marbles = marblesRef.current;
      if (marbles.length > 0) {
        marbles[0].dist += CHAIN_SPEED * dt;
        if (marbles[0].dist >= PATH_LEN) {
          setGameStatus('lost');
          return;
        }
        for (let i = 1; i < marbles.length; i++) {
          const desired = marbles[i - 1].dist - SPACING;
          marbles[i].dist += (desired - marbles[i].dist) * Math.min(1, dt * 8);
        }
      }

      const shot = shotRef.current;
      if (shot) {
        shot.x += shot.vx * dt;
        shot.y += shot.vy * dt;
        if (shot.x < -60 || shot.x > W + 60 || shot.y < -60 || shot.y > H + 60) {
          shotRef.current = null;
        } else {
          for (let k = 0; k < marbles.length; k++) {
            if (marbles[k].dist < 0) break;
            const p = pointAt(marbles[k].dist);
            if (Math.hypot(shot.x - p.x, shot.y - p.y) < MARBLE_R * 2 - 4) {
              shotRef.current = null;
              marbles.splice(k, 0, { color: shot.color, dist: marbles[k].dist });
              const c = shot.color;
              let a = k;
              while (a > 0 && marbles[a - 1].color === c) a--;
              let b = k;
              while (b < marbles.length - 1 && marbles[b + 1].color === c) b++;
              const run = b - a + 1;
              if (run >= 3) {
                const removed = marbles.splice(a, run);
                scoreRef.current += run * 100 + (run - 3) * 50;
                setScore(scoreRef.current);
                for (const m of removed) {
                  if (m.dist >= 0) {
                    const pp = pointAt(m.dist);
                    spawnParticles(pp.x, pp.y, COLORS[m.color]);
                  }
                }
                if (marbles.length === 0) setGameStatus('won');
              }
              break;
            }
          }
        }
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= dt * 1.8;
        if (p.life <= 0) particlesRef.current.splice(i, 1);
      }
    };

    const draw = (time: number) => {
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(0,243,255,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 36) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += 36) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(0,243,255,0.22)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pathPts[0].x, pathPts[0].y);
      for (let i = 1; i < pathPts.length; i++) ctx.lineTo(pathPts[i].x, pathPts[i].y);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0,243,255,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pathPts[0].x, pathPts[0].y, MARBLE_R + 3, 0, Math.PI * 2);
      ctx.stroke();

      const pulse = 3 + Math.sin(time / 200) * 2;
      ctx.fillStyle = '#ff2d95';
      ctx.shadowColor = '#ff2d95';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(HOLE.x, HOLE.y, MARBLE_R + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      for (const m of marblesRef.current) {
        if (m.dist < 0) continue;
        const p = pointAt(m.dist);
        ctx.fillStyle = COLORS[m.color];
        ctx.shadowColor = COLORS[m.color];
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, MARBLE_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.arc(p.x - 3.5, p.y - 3.5, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      const shot = shotRef.current;
      if (shot) {
        ctx.fillStyle = COLORS[shot.color];
        ctx.shadowColor = COLORS[shot.color];
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, MARBLE_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (aimingRef.current && !shotRef.current) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.moveTo(SHOOTER.x, SHOOTER.y);
        ctx.lineTo(
          SHOOTER.x + Math.cos(angleRef.current) * 140,
          SHOOTER.y + Math.sin(angleRef.current) * 140
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }

      for (const p of particlesRef.current) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
      ctx.globalAlpha = 1;

      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(SHOOTER.x, SHOOTER.y, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = COLORS[currentColorRef.current];
      ctx.shadowColor = COLORS[currentColorRef.current];
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(SHOOTER.x, SHOOTER.y, MARBLE_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = COLORS[nextColorRef.current];
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(SHOOTER.x + 34, SHOOTER.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (statusRef.current === 'playing') update(dt);
      if (progressRef.current && marblesRef.current.length > 0) {
        const pct = Math.min(100, (marblesRef.current[0].dist / PATH_LEN) * 100);
        progressRef.current.style.width = `${pct}%`;
      }
      draw(now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [setGameStatus, spawnParticles]);

  const toCanvas = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (statusRef.current !== 'playing' || shotRef.current) return;
    aimingRef.current = true;
    const p = toCanvas(e.clientX, e.clientY);
    angleRef.current = Math.atan2(p.y - SHOOTER.y, p.x - SHOOTER.x);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!aimingRef.current) return;
    const p = toCanvas(e.clientX, e.clientY);
    angleRef.current = Math.atan2(p.y - SHOOTER.y, p.x - SHOOTER.x);
  };

  const handlePointerUp = () => {
    if (!aimingRef.current) return;
    aimingRef.current = false;
    if (statusRef.current !== 'playing' || shotRef.current) return;
    const a = angleRef.current;
    shotRef.current = {
      x: SHOOTER.x,
      y: SHOOTER.y,
      vx: Math.cos(a) * SHOT_SPEED,
      vy: Math.sin(a) * SHOT_SPEED,
      color: currentColorRef.current,
    };
    currentColorRef.current = nextColorRef.current;
    nextColorRef.current = Math.floor(Math.random() * COLORS.length);
  };

  const handlePause = () => {
    if (statusRef.current === 'playing') {
      aimingRef.current = false;
      setGameStatus('paused');
    }
  };

  const handleRestart = () => {
    initGame();
    setGameStatus('playing');
  };

  const actionBtn =
    'px-6 py-3 rounded-2xl font-black text-sm tracking-wide active:scale-95 transition-transform';

  return (
    <div className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none">
      <MuteButton />

      <div className="pt-14 px-4 pb-2 flex items-center justify-between border-b border-[#ff2d95]/10 bg-gradient-to-b from-[#0a0e17] to-transparent">
        <button
          onClick={() => setScreen('arcade')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-[#ff2d95]/30 text-white text-xs font-bold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#ff2d95]" /> Salir
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-black/60 border border-[#ffb700]/30 rounded-full px-3 py-1">
            <Trophy className="w-3.5 h-3.5 text-[#ffb700]" />
            <span className="text-[#ffb700] text-xs font-bold">{score.toLocaleString()}</span>
          </span>
          {status === 'playing' && (
            <button
              onClick={handlePause}
              className="px-2.5 py-1.5 rounded-full bg-black/60 border border-[#00f3ff]/30 active:scale-95"
              aria-label="Pausar"
            >
              <Pause className="w-4 h-4 text-[#00f3ff]" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-2">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            ref={progressRef}
            className="h-full w-0 bg-gradient-to-r from-[#ff2d95] to-[#ffb700] transition-none"
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => { aimingRef.current = false; }}
          className="border border-[#ff2d95]/30 rounded-2xl shadow-2xl shadow-[#ff2d95]/10 max-h-[62vh] object-contain bg-black/50 touch-none"
        />
      </div>

      {status === 'ready' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 px-8 text-center">
          <Circle className="w-10 h-10 text-[#ff2d95] mb-2" />
          <h1
            className="text-[#ff2d95] font-black text-2xl tracking-wider"
            style={{ textShadow: '0 0 18px rgba(255,45,149,0.6)' }}
          >
            CANICAS EXPLOSIVAS
          </h1>
          <p className="text-white/60 text-sm mt-3 leading-relaxed">
            Arrastra para apuntar y suelta para disparar.<br />
            Junta 3 o más canicas iguales para explotarlas.<br />
            Vacía el camino antes de que llegue al hoyo.
          </p>
          <button
            onClick={() => setGameStatus('playing')}
            className={`${actionBtn} mt-6 bg-gradient-to-r from-[#ff2d95] to-[#ffb700] text-black`}
          >
            EMPEZAR
          </button>
        </div>
      )}

      {status === 'paused' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 px-8 text-center">
          <Pause className="w-12 h-12 text-[#00f3ff] mb-3" />
          <h2
            className="text-white font-black text-xl tracking-wider"
            style={{ textShadow: '0 0 15px rgba(0,243,255,0.5)' }}
          >
            PAUSA
          </h2>
          <p className="text-white/50 text-xs mt-1">
            Puntos: {score.toLocaleString()}
          </p>
          <div className="flex flex-col gap-3 mt-6 w-52">
            <button onClick={() => setGameStatus('playing')} className={`${actionBtn} bg-gradient-to-r from-[#00f3ff] to-cyan-400 text-black flex items-center justify-center gap-2`}>
              <Play className="w-4 h-4" /> REANUDAR
            </button>
            <button onClick={handleRestart} className={`${actionBtn} bg-black/60 border border-white/20 text-white flex items-center justify-center gap-2`}>
              <RotateCcw className="w-4 h-4" /> REINICIAR
            </button>
            <button onClick={() => setScreen('arcade')} className={`${actionBtn} bg-black/60 border border-white/20 text-white/70 flex items-center justify-center gap-2`}>
              <ArrowLeft className="w-4 h-4" /> SALIR
            </button>
          </div>
        </div>
      )}

      {(status === 'won' || status === 'lost') && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 px-8 text-center">
          {status === 'won' ? (
            <>
              <Trophy className="w-14 h-14 text-[#ffb700] mb-3" />
              <h2
                className="text-[#ffb700] font-black text-2xl tracking-wider"
                style={{ textShadow: '0 0 20px rgba(255,183,0,0.6)' }}
              >
                ¡VICTORIA!
              </h2>
              <p className="text-white/60 text-sm mt-2">
                Vaciaste todo el camino de canicas
              </p>
            </>
          ) : (
            <>
              <Circle className="w-14 h-14 text-[#ff2d95] mb-3" />
              <h2
                className="text-[#ff2d95] font-black text-2xl tracking-wider"
                style={{ textShadow: '0 0 20px rgba(255,45,149,0.6)' }}
              >
                ¡DERROTA!
              </h2>
              <p className="text-white/60 text-sm mt-2">
                Las canicas llegaron al hoyo
              </p>
            </>
          )}
          <p className="text-[#ffb700] font-black text-lg mt-4">
            {score.toLocaleString()} puntos
          </p>
          <div className="flex flex-col gap-3 mt-6 w-52">
            <button onClick={handleRestart} className={`${actionBtn} bg-gradient-to-r from-[#ff2d95] to-[#ffb700] text-black flex items-center justify-center gap-2`}>
              <RotateCcw className="w-4 h-4" /> REINICIAR
            </button>
            <button onClick={() => setScreen('arcade')} className={`${actionBtn} bg-black/60 border border-white/20 text-white/70 flex items-center justify-center gap-2`}>
              <ArrowLeft className="w-4 h-4" /> SALIR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
