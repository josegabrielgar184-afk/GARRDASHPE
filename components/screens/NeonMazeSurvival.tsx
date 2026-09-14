'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Coins, Trophy, Zap, Heart } from 'lucide-react';
import { GameOverModal } from '@/components/game/GameOverModal';

const COLS = 15;
const ROWS = 21;
const CELL = 20;
const W = COLS * CELL;
const H = ROWS * CELL;

const MAZE_TEMPLATE = [
  '###############',
  '#.............#',
  '#.###.###.###.#',
  '#.#.......#...#',
  '#.#.#####.#.#.#',
  '#...#...#...#.#',
  '###.#.#.#.###.#',
  '#...#.#.#.....#',
  '#.###.#.#####.#',
  '#.....#.....#.#',
  '#.###.#####.#.#',
  '#...#.......#.#',
  '###.#.#####.#.#',
  '#...#.#...#...#',
  '#.###.#.#.###.#',
  '#.....#.#.....#',
  '#.#####.#.###.#',
  '#.............#',
  '#.###.#####.#.#',
  '#.............#',
  '###############',
];

interface Entity { x: number; y: number; dir: { dx: number; dy: number }; }

function canMove(maze: string[], x: number, y: number): boolean {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
  return maze[y][x] !== '#';
}

export function NeonMazeSurvival() {
  const { setScreen, addCoins, userRole, vip } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [overcharge, setOvercharge] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  const playerRef = useRef<Entity>({ x: 1, y: 1, dir: { dx: 0, dy: 0 } });
  const zombiesRef = useRef<Entity[]>([]);
  const coinPositionsRef = useRef<Set<string>>(new Set());
  const orbRef = useRef<{ x: number; y: number; active: boolean }>({ x: 7, y: 10, active: true });
  const lastOrbTimeRef = useRef<number>(0);
  const overchargeUntilRef = useRef<number>(0);
  const inputDirRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const livesRef = useRef(3);
  const gameOverRef = useRef(false);
  const frameRef = useRef(0);
  const moveTimerRef = useRef(0);
  const zombieMoveTimerRef = useRef(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  const initGame = useCallback(() => {
    playerRef.current = { x: 1, y: 1, dir: { dx: 0, dy: 0 } };
    zombiesRef.current = [
      { x: 13, y: 1, dir: { dx: -1, dy: 0 } },
      { x: 13, y: 19, dir: { dx: 0, dy: -1 } },
      { x: 7, y: 5, dir: { dx: 0, dy: 1 } },
      { x: 1, y: 19, dir: { dx: 1, dy: 0 } },
    ];
    coinPositionsRef.current = new Set();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (MAZE_TEMPLATE[r][c] === '.' && Math.random() < 0.3) {
          coinPositionsRef.current.add(`${c},${r}`);
        }
      }
    }
    orbRef.current = { x: 7, y: 10, active: true };
    lastOrbTimeRef.current = Date.now();
    overchargeUntilRef.current = 0;
    scoreRef.current = 0;
    coinsRef.current = 0;
    livesRef.current = 3;
    gameOverRef.current = false;
    setScore(0);
    setCoinsEarned(0);
    setLives(3);
    setGameOver(false);
    setOvercharge(false);
    setShowTutorial(true);
    startTimeRef.current = Date.now();
    setTimeout(() => setShowTutorial(false), 3000);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') inputDirRef.current = { dx: 0, dy: -1 };
      else if (e.key === 'ArrowDown' || e.key === 's') inputDirRef.current = { dx: 0, dy: 1 };
      else if (e.key === 'ArrowLeft' || e.key === 'a') inputDirRef.current = { dx: -1, dy: 0 };
      else if (e.key === 'ArrowRight' || e.key === 'd') inputDirRef.current = { dx: 1, dy: 0 };
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;
    const MOVE_INTERVAL = 8;
    const ZOMBIE_MOVE_INTERVAL = 12;

    const loop = (time: number) => {
      if (gameOverRef.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const dt = time - lastTime;
      lastTime = time;
      frameRef.current++;
      moveTimerRef.current += dt;
      zombieMoveTimerRef.current += dt;

      const p = playerRef.current;

      if (moveTimerRef.current >= MOVE_INTERVAL * 16) {
        moveTimerRef.current = 0;
        const input = inputDirRef.current;
        if (input.dx !== 0 || input.dy !== 0) {
          const nx = p.x + input.dx;
          const ny = p.y + input.dy;
          if (canMove(MAZE_TEMPLATE, nx, ny)) {
            p.x = nx;
            p.y = ny;
            p.dir = { dx: input.dx, dy: input.dy };
          }
        }
      }

      if (zombieMoveTimerRef.current >= ZOMBIE_MOVE_INTERVAL * 16) {
        zombieMoveTimerRef.current = 0;
        const isOvercharged = Date.now() < overchargeUntilRef.current;
        for (const z of zombiesRef.current) {
          const dirs = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
          ].filter(d => canMove(MAZE_TEMPLATE, z.x + d.dx, z.y + d.dy));

          if (isOvercharged) {
            const away = dirs.sort((a, b) => {
              const da = Math.abs((z.x + a.dx) - p.x) + Math.abs((z.y + a.dy) - p.y);
              const db = Math.abs((z.x + b.dx) - p.x) + Math.abs((z.y + b.dy) - p.y);
              return db - da;
            });
            if (away.length > 0) { z.dir = away[0]; z.x += away[0].dx; z.y += away[0].dy; }
          } else {
            const toward = dirs.sort((a, b) => {
              const da = Math.abs((z.x + a.dx) - p.x) + Math.abs((z.y + a.dy) - p.y);
              const db = Math.abs((z.x + b.dx) - p.x) + Math.abs((z.y + b.dy) - p.y);
              return da - db;
            });
            if (toward.length > 0) { z.dir = toward[0]; z.x += toward[0].dx; z.y += toward[0].dy; }
          }
        }
      }

      const coinKey = `${p.x},${p.y}`;
      if (coinPositionsRef.current.has(coinKey)) {
        coinPositionsRef.current.delete(coinKey);
        coinsRef.current += 5;
        scoreRef.current += 10;
        setScore(scoreRef.current);
        setCoinsEarned(coinsRef.current);
      }

      if (orbRef.current.active && p.x === orbRef.current.x && p.y === orbRef.current.y) {
        orbRef.current.active = false;
        overchargeUntilRef.current = Date.now() + 6000;
        setOvercharge(true);
        lastOrbTimeRef.current = Date.now();
        scoreRef.current += 50;
        setScore(scoreRef.current);
      }

      if (!orbRef.current.active && Date.now() - lastOrbTimeRef.current > 20000) {
        for (let tries = 0; tries < 20; tries++) {
          const rx = Math.floor(Math.random() * COLS);
          const ry = Math.floor(Math.random() * ROWS);
          if (canMove(MAZE_TEMPLATE, rx, ry) && rx !== p.x && ry !== p.y) {
            orbRef.current = { x: rx, y: ry, active: true };
            break;
          }
        }
      }

      if (Date.now() >= overchargeUntilRef.current && overcharge) {
        setOvercharge(false);
      }

      const isOvercharged = Date.now() < overchargeUntilRef.current;
      for (const z of zombiesRef.current) {
        if (z.x === p.x && z.y === p.y) {
          if (isOvercharged) {
            scoreRef.current += 100;
            setScore(scoreRef.current);
            z.x = Math.floor(Math.random() * COLS);
            z.y = Math.floor(Math.random() * ROWS);
            while (!canMove(MAZE_TEMPLATE, z.x, z.y)) {
              z.x = Math.floor(Math.random() * COLS);
              z.y = Math.floor(Math.random() * ROWS);
            }
          } else {
            livesRef.current -= 1;
            setLives(livesRef.current);
            if (livesRef.current <= 0) {
              gameOverRef.current = true;
              setGameOver(true);
              const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
              if (coinsRef.current > 0) addCoins(coinsRef.current);
            } else {
              p.x = 1; p.y = 1;
            }
          }
        }
      }

      // Draw
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(0,243,255,0.15)';
      ctx.lineWidth = 1;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (MAZE_TEMPLATE[r][c] === '#') {
            ctx.fillStyle = 'rgba(0,243,255,0.08)';
            ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
            ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
          }
        }
      }

      ctx.fillStyle = '#ffb700';
      ctx.shadowColor = '#ffb700';
      ctx.shadowBlur = 8;
      for (const ck of Array.from(coinPositionsRef.current)) {
        const [cx, cy] = ck.split(',').map(Number);
        ctx.beginPath();
        ctx.arc(cx * CELL + CELL / 2, cy * CELL + CELL / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      if (orbRef.current.active) {
        const pulse = 0.5 + 0.5 * Math.sin(frameRef.current * 0.1);
        ctx.fillStyle = `rgba(0,243,255,${0.6 + pulse * 0.4})`;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(orbRef.current.x * CELL + CELL / 2, orbRef.current.y * CELL + CELL / 2, 6 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      const playerColor = isOvercharged ? '#00f3ff' : '#34d399';
      ctx.fillStyle = playerColor;
      ctx.shadowColor = playerColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x * CELL + CELL / 2, p.y * CELL + CELL / 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      for (const z of zombiesRef.current) {
        const zColor = isOvercharged ? '#666' : '#ef4444';
        ctx.fillStyle = zColor;
        ctx.shadowColor = zColor;
        ctx.shadowBlur = isOvercharged ? 4 : 8;
        ctx.beginPath();
        ctx.arc(z.x * CELL + CELL / 2, z.y * CELL + CELL / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [addCoins]);

  const handleTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left - rect.width / 2;
    const touchY = e.touches[0].clientY - rect.top - rect.height / 2;
    if (Math.abs(touchX) > Math.abs(touchY)) {
      inputDirRef.current = { dx: touchX > 0 ? 1 : -1, dy: 0 };
    } else {
      inputDirRef.current = { dx: 0, dy: touchY > 0 ? 1 : -1 };
    }
  };

  const handleRevive = () => {
    livesRef.current = 2;
    setLives(2);
    gameOverRef.current = false;
    setGameOver(false);
    playerRef.current = { x: 1, y: 1, dir: { dx: 0, dy: 0 } };
  };

  const handleDoubleCoins = () => {
    coinsRef.current *= 2;
    setCoinsEarned(coinsRef.current);
    if (coinsRef.current > 0) addCoins(coinsRef.current);
  };

  const handleClose = () => {
    setScreen('arcade');
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden">
      <MuteButton />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-gradient-to-b from-[#0a0e17] to-transparent">
        <button onClick={() => setScreen('arcade')} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/50 backdrop-blur text-white text-sm font-bold active:scale-95">
          <ArrowLeft className="w-5 h-5" /> Salir
        </button>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 bg-black/50 rounded-full px-3 py-1.5">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400 text-xs font-bold">{lives}</span>
          </span>
          <span className="flex items-center gap-1 bg-black/50 rounded-full px-3 py-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#ffb700]" />
            <span className="text-[#ffb700] text-xs font-bold">{score.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1 bg-black/50 rounded-full px-3 py-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold">{coinsEarned}</span>
          </span>
        </div>
      </div>

      {overcharge && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-[#00f3ff]/20 border border-[#00f3ff]/50 animate-pulse">
          <span className="text-[#00f3ff] text-xs font-black flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> MODO OVERCHARGE - ¡Devora zombis!
          </span>
        </div>
      )}

      {showTutorial && !gameOver && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fade-in">
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-black/60 text-[#00f3ff] border border-[#00f3ff]/30">
            DESLIZA PARA MOVER · RECOLECTA MONEDAS
          </span>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center pt-16 pb-20">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          className="touch-none max-w-full max-h-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      <GameOverModal
        open={gameOver}
        onClose={handleClose}
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
