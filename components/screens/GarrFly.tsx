'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Coins, Trophy, Heart } from 'lucide-react';
import { GameOverModal } from '@/components/game/GameOverModal';

const W = 360;
const H = 540;
const GRAVITY = 0.38;
const JUMP = -6.8;
const PIPE_SPEED = 2.2;
const PIPE_SPAWN_RATE = 110;
const GAP_SIZE = 130;

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
  hasCoin: boolean;
  coinCollected: boolean;
  coinY: number;
}

export function GarrFly() {
  const { setScreen, addCoins, userRole, vip } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [lives, setLives] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const playerYRef = useRef(H / 2);
  const velocityRef = useRef(0);
  const pipesRef = useRef<Pipe[]>([]);
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const gameOverRef = useRef(false);
  const gameStartedRef = useRef(false);
  const rafRef = useRef<number>(0);

  const initGame = useCallback(() => {
    playerYRef.current = H / 2;
    velocityRef.current = 0;
    pipesRef.current = [];
    frameCountRef.current = 0;
    scoreRef.current = 0;
    coinsRef.current = 0;
    gameOverRef.current = false;
    gameStartedRef.current = false;
    setScore(0);
    setCoinsEarned(0);
    setLives(1);
    setGameOver(false);
    setGameStarted(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleJump = useCallback(() => {
    if (gameOverRef.current) return;
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      setGameStarted(true);
    }
    velocityRef.current = JUMP;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

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

      ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }
      for (let j = 0; j < H; j += 30) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke();
      }

      if (gameStartedRef.current) {
        velocityRef.current += GRAVITY;
        playerYRef.current += velocityRef.current;
        frameCountRef.current++;

        if (frameCountRef.current % PIPE_SPAWN_RATE === 0) {
          const minTop = 60;
          const maxTop = H - GAP_SIZE - 80;
          const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
          const bottomY = topHeight + GAP_SIZE;
          const hasCoin = Math.random() < 0.7;

          pipesRef.current.push({
            x: W,
            topHeight,
            bottomY,
            passed: false,
            hasCoin,
            coinCollected: false,
            coinY: topHeight + GAP_SIZE / 2,
          });
        }

        const playerX = 70;
        const playerRadius = 12;

        if (playerYRef.current - playerRadius <= 0 || playerYRef.current + playerRadius >= H) {
          gameOverRef.current = true;
          setGameOver(true);
          if (coinsRef.current > 0) addCoins(coinsRef.current);
        }

        for (let i = pipesRef.current.length - 1; i >= 0; i--) {
          const p = pipesRef.current[i];
          p.x -= PIPE_SPEED;

          if (!p.passed && p.x + 40 < playerX) {
            p.passed = true;
            scoreRef.current += 10;
            setScore(scoreRef.current);
          }

          if (p.hasCoin && !p.coinCollected) {
            const dx = playerX - (p.x + 20);
            const dy = playerYRef.current - p.coinY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < playerRadius + 8) {
              p.coinCollected = true;
              coinsRef.current += 1;
              setCoinsEarned(coinsRef.current);
            }
          }

          if (
            playerX + playerRadius > p.x &&
            playerX - playerRadius < p.x + 40 &&
            (playerYRef.current - playerRadius < p.topHeight || playerYRef.current + playerRadius > p.bottomY)
          ) {
            gameOverRef.current = true;
            setGameOver(true);
            if (coinsRef.current > 0) addCoins(coinsRef.current);
          }

          if (p.x < -50) {
            pipesRef.current.splice(i, 1);
          }
        }
      }

      ctx.fillStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 10;
      for (const p of pipesRef.current) {
        ctx.fillRect(p.x, 0, 40, p.topHeight);
        ctx.fillRect(p.x, p.bottomY, 40, H - p.bottomY);

        if (p.hasCoin && !p.coinCollected) {
          ctx.fillStyle = '#ffb700';
          ctx.shadowColor = '#ffb700';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x + 20, p.coinY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#00f3ff';
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 10;
        }
      }
      ctx.shadowBlur = 0;

      const px = 70;
      const py = playerYRef.current;
      ctx.fillStyle = '#ffb700';
      ctx.shadowColor = '#ffb700';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#0a0e17';
      ctx.beginPath();
      ctx.arc(px + 4, py - 3, 3, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [addCoins]);

  const handleRevive = () => {
    gameOverRef.current = false;
    setGameOver(false);
    playerYRef.current = H / 2;
    velocityRef.current = JUMP;
    pipesRef.current = pipesRef.current.filter((p) => p.x < 30 || p.x > 180);
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
    <div
      onClick={handleJump}
      className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none cursor-pointer"
    >
      <MuteButton />

      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-gradient-to-b from-[#0a0e17] to-transparent pointer-events-none">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScreen('arcade');
          }}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 border border-[#00f3ff]/30 text-white text-sm font-bold active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-[#00f3ff]" /> Salir
        </button>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-black/60 border border-red-500/30 rounded-full px-3 py-1.5">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400 text-xs font-bold">{lives}</span>
          </span>
          <span className="flex items-center gap-1 bg-black/60 border border-amber-500/30 rounded-full px-3 py-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#ffb700]" />
            <span className="text-[#ffb700] text-xs font-bold">{score.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1 bg-black/60 border border-amber-400/30 rounded-full px-3 py-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold">{coinsEarned}</span>
          </span>
        </div>
      </div>

      {!gameStarted && !gameOver && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[#00f3ff] font-black text-lg animate-bounce tracking-widest">
            ¡TOCA PARA VOLAR!
          </p>
          <p className="text-white/40 text-xs mt-1">Esquiva tuberías neón</p>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center pt-14 pb-6 text-center">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="touch-none border border-[#00f3ff]/20 rounded-xl shadow-lg shadow-[#00f3ff]/10 max-h-[70vh]"
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
