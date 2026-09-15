'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Coins, Trophy, Zap, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { GameOverModal } from '@/components/game/GameOverModal';

type ArrowDir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const ARROW_ICONS: Record<ArrowDir, any> = {
  UP: ArrowUp,
  DOWN: ArrowDown,
  LEFT: ArrowLeftIcon,
  RIGHT: ArrowRightIcon,
};

const ALL_DIRS: ArrowDir[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

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

  const [turn, setTurn] = useState(1);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [sequence, setSequence] = useState<ArrowDir[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerProgress, setTimerProgress] = useState(100);
  const [gameOver, setGameOver] = useState(false);

  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const turnRef = useRef(1);
  const sequenceRef = useRef<ArrowDir[]>([]);
  const indexRef = useRef(0);
  const timerRef = useRef(100);
  const particlesRef = useRef<Particle[]>([]);
  const gameOverRef = useRef(false);

  const generateSequence = useCallback((turnNum: number) => {
    const length = 3 + Math.floor(turnNum / 2);
    const newSeq: ArrowDir[] = [];
    for (let i = 0; i < length; i++) {
      newSeq.push(ALL_DIRS[Math.floor(Math.random() * ALL_DIRS.length)]);
    }
    sequenceRef.current = newSeq;
    indexRef.current = 0;
    timerRef.current = 100;

    setSequence(newSeq);
    setCurrentIndex(0);
    setTimerProgress(100);
  }, []);

  const initGame = useCallback(() => {
    turnRef.current = 1;
    scoreRef.current = 0;
    coinsRef.current = 0;
    gameOverRef.current = false;
    particlesRef.current = [];

    setTurn(1);
    setScore(0);
    setCoinsEarned(0);
    setGameOver(false);
    generateSequence(1);
  }, [generateSequence]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Temporizador por Turno
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameOverRef.current) return;

      if (timerRef.current > 0) {
        timerRef.current -= 1.8;
        setTimerProgress(Math.max(0, timerRef.current));
      } else {
        gameOverRef.current = true;
        setGameOver(true);
        if (coinsRef.current > 0) addCoins(coinsRef.current);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [addCoins]);

  const createSparks = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
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

  const handleArrowPress = (dir: ArrowDir) => {
    if (gameOverRef.current) return;

    const expected = sequenceRef.current[indexRef.current];

    if (dir === expected) {
      // Impacto Daga Neón
      createSparks(180, 160, '#00f3ff', 12);
      indexRef.current += 1;
      setCurrentIndex(indexRef.current);

      scoreRef.current += 50;
      coinsRef.current = Math.floor(scoreRef.current / 100);
      setScore(scoreRef.current);
      setCoinsEarned(coinsRef.current);

      // Turno Completado
      if (indexRef.current >= sequenceRef.current.length) {
        createSparks(180, 160, '#ffb700', 25);
        scoreRef.current += 200;
        setScore(scoreRef.current);

        setTimeout(() => {
          turnRef.current += 1;
          setTurn(turnRef.current);
          generateSequence(turnRef.current);
        }, 300);
      }
    } else {
      // Error de Flecha -> Fin de Turno / Perdió
      createSparks(180, 160, '#ef4444', 20);
      gameOverRef.current = true;
      setGameOver(true);
      if (coinsRef.current > 0) addCoins(coinsRef.current);
    }
  };

  // Canvas Target Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, 360, 320);

      // Rejilla
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 360; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 320); ctx.stroke();
      }

      // Objetivo Neón Central
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(180, 160, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00f3ff';
      ctx.beginPath();
      ctx.arc(180, 160, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Partículas
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
        ctx.fillRect(p.x, p.y, 4, 4);
        ctx.globalAlpha = 1.0;
      }

      requestAnimationFrame(loop);
    };

    const raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleRevive = () => {
    gameOverRef.current = false;
    setGameOver(false);
    timerRef.current = 100;
    indexRef.current = 0;
    setCurrentIndex(0);
    setTimerProgress(100);
  };

  const handleDoubleCoins = () => {
    coinsRef.current *= 2;
    setCoinsEarned(coinsRef.current);
    if (coinsRef.current > 0) addCoins(coinsRef.current);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none">
      <MuteButton />

      {/* Header */}
      <div className="pt-14 px-4 pb-2 flex items-center justify-between border-b border-[#00f3ff]/10 bg-gradient-to-b from-[#0a0e17] to-transparent">
        <button
          onClick={() => setScreen('arcade')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-[#00f3ff]/30 text-white text-xs font-bold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#00f3ff]" /> Salir
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-black/60 border border-purple-500/30 rounded-full px-3 py-1">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-400 text-xs font-bold">Turno {turn}</span>
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

      {/* Barra de Tiempo del Turno */}
      <div className="px-4 pt-3">
        <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-[#00f3ff]/30">
          <div
            className="h-full bg-gradient-to-r from-[#00f3ff] to-purple-500 transition-all duration-75"
            style={{ width: `${timerProgress}%` }}
          />
        </div>
      </div>

      {/* Canvas Objetivo */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 relative">
        <canvas
          ref={canvasRef}
          width={360}
          height={320}
          className="border border-[#00f3ff]/30 rounded-2xl shadow-xl shadow-purple-500/10 max-h-[40vh] object-contain bg-black/40"
        />

        {/* Secuencia de Flechas del Turno */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {sequence.map((dir, idx) => {
            const Icon = ARROW_ICONS[dir];
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-95'
                    : isCurrent
                    ? 'bg-[#00f3ff]/20 border-[#00f3ff] text-[#00f3ff] scale-110 animate-bounce'
                    : 'bg-black/40 border-white/10 text-white/30'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Botones de Flechas de Control en Cruz */}
      <div className="pb-8 pt-2 flex flex-col items-center justify-center gap-1">
        <button
          onClick={() => handleArrowPress('UP')}
          className="p-3.5 bg-purple-500/20 border border-purple-500/40 rounded-xl text-purple-300 active:scale-90"
        >
          <ArrowUp className="w-7 h-7" />
        </button>
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleArrowPress('LEFT')}
            className="p-3.5 bg-purple-500/20 border border-purple-500/40 rounded-xl text-purple-300 active:scale-90"
          >
            <ArrowLeftIcon className="w-7 h-7" />
          </button>
          <button
            onClick={() => handleArrowPress('DOWN')}
            className="p-3.5 bg-purple-500/20 border border-purple-500/40 rounded-xl text-purple-300 active:scale-90"
          >
            <ArrowDown className="w-7 h-7" />
          </button>
          <button
            onClick={() => handleArrowPress('RIGHT')}
            className="p-3.5 bg-purple-500/20 border border-purple-500/40 rounded-xl text-purple-300 active:scale-90"
          >
            <ArrowRightIcon className="w-7 h-7" />
          </button>
        </div>
      </div>

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
