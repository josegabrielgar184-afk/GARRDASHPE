'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Coins, Trophy, Zap } from 'lucide-react';
import { GameOverModal } from '@/components/game/GameOverModal';

const W = 360;
const H = 500;
const WHEEL_Y = 160;
const WHEEL_RADIUS = 60;
const KNIFE_LENGTH = 45;

interface StuckKnife {
  angle: number;
}

interface FlyingKnife {
  y: number;
  speed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export function GarrBlade() {
  const { setScreen, addCoins, userRole, vip } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [knivesLeft, setKnivesLeft] = useState(7);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const wheelAngleRef = useRef(0);
  const wheelSpeedRef = useRef(0.03);
  const stuckKnivesRef = useRef<StuckKnife[]>([]);
  const flyingKnifeRef = useRef<FlyingKnife | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const knivesLeftRef = useRef(7);
  const levelRef = useRef(1);
  const gameOverRef = useRef(false);
  const rafRef = useRef<number>(0);

  const startLevel = useCallback((lvl: number) => {
    stuckKnivesRef.current = [];
    flyingKnifeRef.current = null;
    const knivesCount = 5 + Math.min(lvl, 5);
    knivesLeftRef.current = knivesCount;
    wheelSpeedRef.current = 0.025 + lvl * 0.008;
    setKnivesLeft(knivesCount);
    setLevel(lvl);
  }, []);

  const initGame = useCallback(() => {
    scoreRef.current = 0;
    coinsRef.current = 0;
    levelRef.current = 1;
    gameOverRef.current = false;
    particlesRef.current = [];

    setScore(0);
    setCoinsEarned(0);
    setGameOver(false);
    startLevel(1);
  }, [startLevel]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const createSparks = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1.0,
      });
    }
  };

  const handleThrow = useCallback(() => {
    if (gameOverRef.current || flyingKnifeRef.current || knivesLeftRef.current <= 0) return;

    flyingKnifeRef.current = {
      y: H - 70,
      speed: 22,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      if (gameOverRef.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(0, 243, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }

      wheelAngleRef.current += wheelSpeedRef.current;

      const wx = W / 2;
      const wy = WHEEL_Y;

      stuckKnivesRef.current.forEach((k) => {
        const currentAngle = k.angle + wheelAngleRef.current;
        const kx = wx + Math.cos(currentAngle) * WHEEL_RADIUS;
        const ky = wy + Math.sin(currentAngle) * WHEEL_RADIUS;

        ctx.save();
        ctx.translate(kx, ky);
        ctx.rotate(currentAngle + Math.PI / 2);

        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 10;
        ctx.fillRect(-3, 0, 6, KNIFE_LENGTH);
        ctx.restore();
      });
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(wx, wy, WHEEL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffb700';
      ctx.beginPath();
      ctx.arc(wx, wy, 12, 0, Math.PI * 2);
      ctx.fill();

      if (flyingKnifeRef.current) {
        flyingKnifeRef.current.y -= flyingKnifeRef.current.speed;
        const fy = flyingKnifeRef.current.y;

        if (fy <= wy + WHEEL_RADIUS) {
          const impactAngle = Math.PI / 2 - wheelAngleRef.current;
          const normalizedImpact = (impactAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

          let collided = false;
          for (const k of stuckKnivesRef.current) {
            const kAngle = (k.angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            const diff = Math.abs(kAngle - normalizedImpact);
            const minDiff = Math.min(diff, Math.PI * 2 - diff);

            if (minDiff < 0.22) {
              collided = true;
              break;
            }
          }

          if (collided) {
            createSparks(wx, wy + WHEEL_RADIUS, '#ef4444', 20);
            gameOverRef.current = true;
            setGameOver(true);
            if (coinsRef.current > 0) addCoins(coinsRef.current);
          } else {
            stuckKnivesRef.current.push({ angle: impactAngle });
            createSparks(wx, wy + WHEEL_RADIUS, '#00f3ff', 12);

            knivesLeftRef.current -= 1;
            setKnivesLeft(knivesLeftRef.current);

            scoreRef.current += 100;
            coinsRef.current = Math.floor(scoreRef.current / 150);
            setScore(scoreRef.current);
            setCoinsEarned(coinsRef.current);

            flyingKnifeRef.current = null;

            if (knivesLeftRef.current <= 0) {
              createSparks(wx, wy, '#ffb700', 30);
              setTimeout(() => {
                levelRef.current += 1;
                startLevel(levelRef.current);
              }, 400);
            }
          }
        } else {
          ctx.fillStyle = '#00f3ff';
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 12;
          ctx.fillRect(wx - 3, fy, 6, KNIFE_LENGTH);
          ctx.shadowBlur = 0;
        }
      } else {
        if (knivesLeftRef.current > 0) {
          ctx.fillStyle = '#00f3ff';
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 10;
          ctx.fillRect(wx - 3, H - 70, 6, KNIFE_LENGTH);
          ctx.shadowBlur = 0;
        }
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1.0;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [addCoins, startLevel]);

  const handleRevive = () => {
    gameOverRef.current = false;
    setGameOver(false);
    knivesLeftRef.current = Math.max(2, knivesLeftRef.current);
    setKnivesLeft(knivesLeftRef.current);
    stuckKnivesRef.current.pop();
  };

  const handleDoubleCoins = () => {
    coinsRef.current *= 2;
    setCoinsEarned(coinsRef.current);
    if (coinsRef.current > 0) addCoins(coinsRef.current);
  };

  return (
    <div
      onClick={handleThrow}
      className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none cursor-pointer"
    >
      <MuteButton />

      <div className="pt-14 px-4 pb-2 flex items-center justify-between border-b border-[#00f3ff]/10 bg-gradient-to-b from-[#0a0e17] to-transparent">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScreen('arcade');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-[#00f3ff]/30 text-white text-xs font-bold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#00f3ff]" /> Salir
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-black/60 border border-[#00f3ff]/30 rounded-full px-3 py-1">
            <Zap className="w-3.5 h-3.5 text-[#00f3ff]" />
            <span className="text-[#00f3ff] text-xs font-bold">Nivel {level}</span>
          </span>
          <span className="flex items-center gap-1 bg-black/60 border border-amber-500/30 rounded-full px-3 py-1">
            <Trophy className="w-3.5 h-3.5 text-[#ffb700]" />
            <span className="text-[#ffb700] text-xs font-bold">{score.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1 bg-black/60 border border-amber-400/30 rounded-full px-3 py-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold">{coinsEarned}</span>
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-2 relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="border border-[#00f3ff]/30 rounded-2xl shadow-2xl shadow-[#00f3ff]/10 max-h-[62vh] object-contain bg-black/40"
        />

        <div className="mt-3 flex items-center gap-1.5">
          {Array.from({ length: knivesLeft }).map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-6 rounded-full bg-[#00f3ff] shadow-sm shadow-[#00f3ff] animate-pulse"
            />
          ))}
        </div>
      </div>

      <p className="text-white/40 text-[10px] font-bold pb-4 text-center uppercase tracking-widest">
        Toca en cualquier parte para lanzar la daga
      </p>

      <GameOverModal
        open={gameOver}
        onClose={() => setScreen('arcade')}
        score={score}
        coinsEarned={coinsEarned}
        onRevive={handleRevive}
        onDoubleCoins={handleDoubleCoins}
        userRole={userRole}
        vip={vip}
      />
    </div>
  );
}
