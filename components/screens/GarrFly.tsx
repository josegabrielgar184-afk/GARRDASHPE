'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Coins, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { GameOverModal } from '@/components/game/GameOverModal';

const GRID_SIZE = 18;
const COLS = 18;
const ROWS = 24;
const W = COLS * GRID_SIZE;
const H = ROWS * GRID_SIZE;
const INITIAL_SPEED = 110;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Point = { x: number; y: number };

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export function GarrFly() {
  const { setScreen, addCoins, userRole, vip } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const snakeRef = useRef<Point[]>([
    { x: 9, y: 12 },
    { x: 9, y: 13 },
    { x: 9, y: 14 },
  ]);
  const dirRef = useRef<Direction>('UP');
  const nextDirRef = useRef<Direction>('UP');
  const coinRef = useRef<Point>({ x: 9, y: 5 });
  const particlesRef = useRef<Particle[]>([]);

  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const gameOverRef = useRef(false);
  const gameStartedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Control de cobro único para evitar duplicados incorrectos
  const baseCoinsAddedRef = useRef(false);
  const doubledRef = useRef(false);

  const spawnCoin = useCallback((currentSnake: Point[]) => {
    let newCoin: Point;
    while (true) {
      newCoin = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
      const collides = currentSnake.some((segment) => segment.x === newCoin.x && segment.y === newCoin.y);
      if (!collides) break;
    }
    coinRef.current = newCoin;
  }, []);

  const initGame = useCallback(() => {
    const initialSnake = [
      { x: 9, y: 12 },
      { x: 9, y: 13 },
      { x: 9, y: 14 },
    ];
    snakeRef.current = initialSnake;
    dirRef.current = 'UP';
    nextDirRef.current = 'UP';
    particlesRef.current = [];
    scoreRef.current = 0;
    coinsRef.current = 0;
    gameOverRef.current = false;
    gameStartedRef.current = false;
    baseCoinsAddedRef.current = false;
    doubledRef.current = false;

    setScore(0);
    setCoinsEarned(0);
    setGameOver(false);
    setGameStarted(false);
    spawnCoin(initialSnake);
  }, [spawnCoin]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const changeDirection = useCallback((newDir: Direction) => {
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      setGameStarted(true);
    }

    const current = dirRef.current;
    if (newDir === 'UP' && current !== 'DOWN') nextDirRef.current = 'UP';
    if (newDir === 'DOWN' && current !== 'UP') nextDirRef.current = 'DOWN';
    if (newDir === 'LEFT' && current !== 'RIGHT') nextDirRef.current = 'LEFT';
    if (newDir === 'RIGHT' && current !== 'LEFT') nextDirRef.current = 'RIGHT';
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') changeDirection('UP');
      if (e.key === 'ArrowDown' || e.key === 's') changeDirection('DOWN');
      if (e.key === 'ArrowLeft' || e.key === 'a') changeDirection('LEFT');
      if (e.key === 'ArrowRight' || e.key === 'd') changeDirection('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 20) {
        changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      }
    } else {
      if (Math.abs(dy) > 20) {
        changeDirection(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  const createSparks = (x: number, y: number) => {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#ffb700',
        life: 1.0,
      });
    }
  };

  const triggerGameOver = () => {
    if (!gameOverRef.current) {
      gameOverRef.current = true;
      setGameOver(true);
      if (coinsRef.current > 0 && !baseCoinsAddedRef.current) {
        baseCoinsAddedRef.current = true;
        addCoins(coinsRef.current);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const interval = setInterval(() => {
      if (gameOverRef.current) return;

      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      if (gameStartedRef.current) {
        dirRef.current = nextDirRef.current;
        const head = { ...snakeRef.current[0] };

        if (dirRef.current === 'UP') head.y -= 1;
        if (dirRef.current === 'DOWN') head.y += 1;
        if (dirRef.current === 'LEFT') head.x -= 1;
        if (dirRef.current === 'RIGHT') head.x += 1;

        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
          triggerGameOver();
          return;
        }

        for (const segment of snakeRef.current) {
          if (segment.x === head.x && segment.y === head.y) {
            triggerGameOver();
            return;
          }
        }

        snakeRef.current.unshift(head);

        if (head.x === coinRef.current.x && head.y === coinRef.current.y) {
          scoreRef.current += 100;
          coinsRef.current += 1;
          setScore(scoreRef.current);
          setCoinsEarned(coinsRef.current);

          createSparks(
            head.x * GRID_SIZE + GRID_SIZE / 2,
            head.y * GRID_SIZE + GRID_SIZE / 2
          );

          spawnCoin(snakeRef.current);
        } else {
          snakeRef.current.pop();
        }
      }

      const coinX = coinRef.current.x * GRID_SIZE + GRID_SIZE / 2;
      const coinY = coinRef.current.y * GRID_SIZE + GRID_SIZE / 2;
      ctx.fillStyle = '#ffb700';
      ctx.shadowColor = '#ffb700';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(coinX, coinY, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      snakeRef.current.forEach((segment, index) => {
        const isHead = index === 0;
        ctx.fillStyle = isHead ? '#ffffff' : '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = isHead ? 16 : 8;

        const x = segment.x * GRID_SIZE + 1;
        const y = segment.y * GRID_SIZE + 1;
        const size = GRID_SIZE - 2;

        ctx.fillRect(x, y, size, size);
      });
      ctx.shadowBlur = 0;

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
    }, INITIAL_SPEED);

    return () => clearInterval(interval);
  }, [addCoins, spawnCoin]);

  const handleRevive = () => {
    gameOverRef.current = false;
    setGameOver(false);
    snakeRef.current = snakeRef.current.slice(0, Math.max(3, Math.floor(snakeRef.current.length / 2)));
  };

  const handleDoubleCoins = () => {
    if (coinsRef.current > 0 && !doubledRef.current) {
      doubledRef.current = true;
      addCoins(coinsRef.current); // Añade exactamente el bono extra una sola vez
      // Dejamos que GameOverModal multiplique visualmente la base * 2
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none">
      <MuteButton />

      <div className="pt-14 px-4 pb-2 flex items-center justify-between border-b border-[#00f3ff]/10 bg-gradient-to-b from-[#0a0e17] to-transparent">
        <button
          onClick={() => setScreen('arcade')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-[#00f3ff]/30 text-white text-xs font-bold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#00f3ff]" /> Salir
        </button>

        <div className="flex items-center gap-2">
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

      {!gameStarted && !gameOver && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[#00f3ff] font-black text-lg animate-bounce tracking-widest">
            ¡DESLIZA O USA LOS BOTONES!
          </p>
          <p className="text-white/50 text-xs mt-1">Come monedas neón para crecer</p>
        </div>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 flex items-center justify-center p-2 touch-none"
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="border border-[#00f3ff]/30 rounded-2xl shadow-2xl shadow-[#00f3ff]/10 max-h-[60vh] object-contain bg-black/50"
        />
      </div>

      <div className="pb-6 pt-1 flex flex-col items-center justify-center gap-1">
        <button
          onClick={() => changeDirection('UP')}
          className="p-3 bg-[#00f3ff]/15 border border-[#00f3ff]/40 rounded-xl text-[#00f3ff] active:scale-90"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-6">
          <button
            onClick={() => changeDirection('LEFT')}
            className="p-3 bg-[#00f3ff]/15 border border-[#00f3ff]/40 rounded-xl text-[#00f3ff] active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => changeDirection('DOWN')}
            className="p-3 bg-[#00f3ff]/15 border border-[#00f3ff]/40 rounded-xl text-[#00f3ff] active:scale-90"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
          <button
            onClick={() => changeDirection('RIGHT')}
            className="p-3 bg-[#00f3ff]/15 border border-[#00f3ff]/40 rounded-xl text-[#00f3ff] active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
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
